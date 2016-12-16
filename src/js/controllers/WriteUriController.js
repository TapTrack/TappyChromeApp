app.controller('WriteUriController',['$rootScope','$scope', '$mdDialog','ErrorDialogService','StatusBarService','WriteModeService','TappyService','WriteMessageToasterService','TappyCapabilityService',
        function($rootScope, $scope, $mdDialog, ErrorDialogService, StatusBarService, WriteModeService,TappyService, WriteMessageToasterService, TappyCapabilityService) {
    
    $scope.ndefRecord = Ndef.Utils.createUriRecord("http://");

    $scope.supportsEmulation = TappyCapabilityService.supportsEmulation();
    $scope.supportsMirroredWrite = TappyCapabilityService.hasMirroredWrite();
    $scope.mirrorWrite = false;

    var uriSlot = 2;
    
    $scope.selectedMode = WriteModeService.getDefaultMode();
    $scope.writeModes = WriteModeService.getModes();
    
    $scope.logRecord = function() {
        console.log($scope.ndefRecord);
        console.log(Ndef.Utils.resolveUriRecordToString($scope.ndefRecord));
    };

    $scope.writeModeSelected = function(idx) {
        $scope.selectedMode = $scope.writeModes[idx];
    };
  
    var writeCount = 0;

    $scope.requestStop = function() {
        var tappy = TappyService.getTappy();

        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setTransientStatus("Stopping tappy");
            tappy.stop(false,
                    function(){
                        StatusBarService.setTransientStatus("Tappy stopped");
                    },
                    ErrorDialogService.shimErrorResponseCb);
        }
    };

    $scope.initiateWrite = function() {
        writeCount = 0;
        $scope.sendWrite();
    };

    $scope.requestEmulate = function() {
        var tappy = TappyService.getTappy();

        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            var msg = new Ndef.Message([$scope.ndefRecord]);
            StatusBarService.setTransientStatus("Starting emulation");
            tappy.emulateNdef(msg.toByteArray(),function() {
                WriteMessageToasterService.customToast("Emulated Tag Scanned");
            },function(err) {
                tappy.stop();
                ErrorDialogService.shimErrorResponseCb(err);
            });
        }

    };

    $scope.sendWrite = function() {
        var tappy = TappyService.getTappy();

        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            var toaster = WriteMessageToasterService
                .createToaster(
                    $scope.selectedMode.locks,
                    $scope.selectedMode.continuous); 
            if($scope.mirrorWrite) {
                var msg = new Ndef.Message([$scope.ndefRecord]);
                StatusBarService.setStatus("Waiting for tap...");
                
                tappy.writeMirroredNdef(msg.toByteArray(),$scope.selectedMode.locks,$scope.selectedMode.continuous,
                        function() {
                            writeCount++;
                            toaster(writeCount);
                            StatusBarService.setTransientStatus("Tag Written");
                        },function(err) {
                            tappy.stop();
                            ErrorDialogService.shimErrorResponseCb(err);
                        });
            } else {
                // this is kind of inefficient,
                // but it lets us use the addContent/writeContent
                // flow instead of the newer writeNdef, which isn't
                // supported by older tappies
                var fullUri = Ndef.Utils.resolveUriRecordToString($scope.ndefRecord);

                StatusBarService.setStatus("Waiting for tap...");
                tappy.writeUri(
                        fullUri,
                        $scope.selectedMode.locks,
                        $scope.selectedMode.continuous,
                        function() {
                            writeCount++;
                            toaster(writeCount);
                            StatusBarService.setTransientStatus("Tag Written");
                        },function(err) {
                            tappy.stop();
                            ErrorDialogService.shimErrorResponseCb(err);
                        });
            }
        }
    };

}]);
