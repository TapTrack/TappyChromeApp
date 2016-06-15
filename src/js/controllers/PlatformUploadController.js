app.controller('PlatformUploadController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    var platformSlot = 4;

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
            StatusBarService.setStatus("Waiting for tap...");
            var toaster = WriteMessageToasterService.createToaster(false,true);
            tappy.configurePlatform(true,function(tagType,tagCode) {
                StatusBarService.setTransientStatus("Tag written");
                var hexTagcode = StringUtils.uint8ArrayToHexString(tagCode);
                var launchUrl = "https://members.taptrack.com/x.php?tag_code="+hexTagcode;
                writeCount++;
                toaster(writeCount);
                window.open(launchUrl);
            },ErrorDialogService.shimErrorResponseCb);

        }
    };
}]);
