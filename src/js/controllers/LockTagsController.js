app.controller('LockTagsController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    
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
    $scope.initiateOperation = function() {
        writeCount++;
        $scope.sendWrite();
    };

    var getMessage = function(id,count) {
        return "Tag "+id+" locked";
    };

    $scope.sendWrite = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Starting locking tags");
            tappy.lockTag(
                    true,
                    function(tagType,tagCode) {
                        writeCount++;
                        WriteMessageToasterService.customToast(getMessage(
                                StringUtils.uint8ArrayToHexString(tagCode),
                                writeCount));
                    },
                    ErrorDialogService.shimErrorResponseCb);
            
        }
    };
}]);
