app.controller('WriteTextController',['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    var textSlot = 1;
    
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
            var content = "";
            if(typeof $scope.writeTextContent !== "undefined") {
                content = $scope.writeTextContent.trim();
            }
            StatusBarService.setStatus("Transferring content...");
            tappy.addTextContent(
                textSlot,
                TappyClassic.ContentSlotTypes.TEXT,
                0x00,
                content,
                function(){},
                ErrorDialogService.tappyErrorResponseCb,
                function() {
                    console.log("Initiating write content");
                    StatusBarService.setStatus("Waiting for tap...");
                    var toaster = WriteMessageToasterService
                        .createToaster(
                            $scope.selectedMode.locks,
                            $scope.selectedMode.continuous); 
                    tappy.writeContentToTag(textSlot,$scope.selectedMode.locks,function(frame) {
                        writeCount++;
                        toaster(writeCount);
                        console.log("Tag text written");
                        console.log(frame);
                        if($scope.selectedMode.continuous) {
                            repeat();
                        }
                        else {
                            tappy.sendStop();
                        }
                    },function(error,data) {
                        ErrorDialogService.tappyErrorResponseCb(error,data);
                        tappy.sendStop();
                    },function() {
                    });
                });
        }
    };
}]);
