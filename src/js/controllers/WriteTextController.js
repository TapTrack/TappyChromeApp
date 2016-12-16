app.controller('WriteTextController',['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService','TappyCapabilityService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService, TappyCapabilityService) {
    var textSlot = 1;
    
    $scope.selectedMode = WriteModeService.getDefaultMode();
    $scope.writeModes = WriteModeService.getModes();

    $scope.supportsEmulation = TappyCapabilityService.supportsEmulation();
    $scope.supportsMirroredWrite = TappyCapabilityService.hasMirroredWrite();
    $scope.mirrorWrite = false;
    
    $scope.writeModeSelected = function(idx) {
        $scope.selectedMode = $scope.writeModes[idx];
    };


    $scope.requestStop = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setTransientStatus("Sending stop command");
            tappy.stop();
        }
    };

    var writeCount = 0;

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
            var content = "";
            if(typeof $scope.writeTextContent !== "undefined") {
                content = $scope.writeTextContent.trim();
            }
            var msg = new Ndef.Message([Ndef.Utils.createTextRecord(content)]);
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
            var content = "";
            if(typeof $scope.writeTextContent !== "undefined") {
                content = $scope.writeTextContent.trim();
            }
            if($scope.mirrorWrite) {
                var msg = new Ndef.Message([Ndef.Utils.createTextRecord(content)]);
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
                StatusBarService.setStatus("Waiting for tap...");
                tappy.writeText(
                        content,
                        $scope.selectedMode.locks,
                        $scope.selectedMode.continuous,
                        function() {
                            writeCount++;
                            toaster(writeCount);
                        },
                        ErrorDialogService.shimErrorDialogCb);
            }
        }
    };
}]);
