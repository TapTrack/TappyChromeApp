app.controller('WriteTextController',['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    var textSlot = 1;
    
    $scope.selectedMode = WriteModeService.getDefaultMode();
    $scope.writeModes = WriteModeService.getModes();
    
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

    $scope.sendWrite = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            var content = "";
            if(typeof $scope.writeTextContent !== "undefined") {
                content = $scope.writeTextContent.trim();
            }
            StatusBarService.setStatus("Waiting for tap...");
            var toaster = WriteMessageToasterService
                .createToaster(
                    $scope.selectedMode.locks,
                    $scope.selectedMode.continuous); 
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
    };
}]);
