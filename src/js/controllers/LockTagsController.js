app.controller('LockTagsController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    
    var repeatTimeout = null;

    var repeat = function() {
        if(repeatTimeout !== null) {
            clearTimeout(repeatTimeout);
        }
        
        repeatTimeout = setTimeout(function () {
            $scope.sendWrite();
        },750);
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
            if(repeatTimeout !== null) {
                clearTimeout(repeatTimeout);
            }
            
            StatusBarService.setStatus("Starting locking tags");
            tappy.lockTag(
                    0,
                    function(tagType,tagCode) {
                        writeCount++;
                        WriteMessageToasterService.customToast(getMessage(
                                StringUtils.uint8ArrayToHexString(tagCode),
                                writeCount));
                        repeat();
                    },
                    ErrorDialogService.tappyErrorResponseCb);
            
        }
    };
}]);
