app.controller('WriteMultiRecordNdefController',
        ['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','MultiRecordNdefService','WriteMessageToasterService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, MultiRecordNdefService, WriteMessageToasterService) {
    $scope.recordService = MultiRecordNdefService;
    $scope.ndefRecords = $scope.recordService.getRecords();
    $scope.ndefRevisionCount = $scope.recordService.changeCount;

    $scope.getRecordService = function() {
        return $scope.recordService;
    };
    
    $scope.deltaTrack = function(index,record) {
        var hashArray = function(array) {
            if(array === null || array.length === 0) {
                return 0;
            }

            var clamper = function(value) {
                var temp = value;
                if(temp > 65536) {
                    count = Math.floor(temp/65536);
                    temp -= count*65536;
                }

                return temp;
            };

            var hash = 1;
            for(var i = 0; i < array.length; i++) {
                hash = clamper(31*hash+array[i]);
            }

            return hash;
        };

        var leftPad = function(value,length) {
            if(value.length >= length) {
                return value;
            }
            else {
                var temp = value;
                while(temp.length < length) {
                    temp = '0'+temp;
                }
                return temp;
            }
        };
        var tnfHash = hashArray(record.getTnf());
        var recordHash = hashArray(record.getType());
        var fullHash = ""+index+leftPad(""+tnfHash,5)+leftPad(""+recordHash,5);
        return fullHash;
    };

    $scope.clearRecords = function() {
        $scope.recordService.clearRecords();
    };

    $scope.addUri = function() {
        $scope.recordService.appendRecord(Ndef.Utils.createUriRecord(""));
    };

    $scope.addText = function() {
        $scope.recordService.appendRecord(Ndef.Utils.createTextRecord("","en"));
    };

    $scope.selectedMode = WriteModeService.getDefaultMode();
    $scope.writeModes = WriteModeService.getModes();
    
    $scope.writeModeSelected = function(idx) {
        $scope.selectedMode = $scope.writeModes[idx];
    };

    var repeatTimeout = null;

    var repeat = function() {
        if(repeatTimeout !== null) {
            clearTimeout(repeatTimeout);
        }
        
        repeatTimeout = setTimeout(function () {
            $scope.sendWrite();
        },500);
    };

    $scope.requestStop = function() {
        var tappy = TappyService.getTappy();
        if(repeatTimeout !== null) {
            clearTimeout(repeatTimeout);
        }

        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setTransientStatus("Sending stop command");
            tappy.sendStop();
        }
    };

    var writeCount = 0;

    $scope.initiateWrite = function() {
        writeCount = 0;
        $scope.sendWrite();
    };

    $scope.sendWrite = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            if(repeatTimeout !== null) {
                clearTimeout(repeatTimeout);
            }
            var records = $scope.recordService.getRecords();
            if(records.length === 0) {
                $mdDialog.show($mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title("Error")
                        .textContent("You cannot write an empty NDEF message")
                        .ok('Ok'));
            }
            else {
                var ndefMessage = new Ndef.Message(records);
                StatusBarService.setStatus("Waiting for tap...");
                var toaster = WriteMessageToasterService
                    .createToaster(
                        $scope.selectedMode.locks,
                        $scope.selectedMode.continuous); 
                tappy.writeCustomNdef(0x00,$scope.selectedMode.locks,ndefMessage.toByteArray(),
                        function() {
                            writeCount++;
                            toaster(writeCount);
                            if($scope.selectedMode.continuous) {
                                repeat();
                            }
                            else {
                                tappy.sendStop();
                            }
                        },
                        function(errorType,data) {
                            ErrorDialogService.tappyErrorResponseCb(errorType,data);
                            tappy.sendStop();
                        });
            }

        }
    };

    $scope.importRecords = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            if(repeatTimeout !== null) {
                clearTimeout(repeatTimeout);
            }
            
            StatusBarService.setStatus("Waiting for tap...");
            tappy.readNdef(0,function(tagType,tagCode, ndefMessage) {
                StatusBarService.setTransientStatus("Tag read");
                $scope.$evalAsync(function(){
                    $scope.recordService.replaceAllRecords(ndefMessage.getRecords());
                });
            },function(errorType, data) {
                ErrorDialogService.tappyErrorResponseCb(errorType,data);
            });
        }
    };

    $scope.$watch(function() {
        return $scope.recordService.changeCount;
    },function (newVal, oldVal, scope) {
        scope.ndefRecords = scope.recordService.getRecords();
        scope.ndefRevisionCount = scope.recordService.changeCount;
    });
    
}]);
