app.controller('LaunchUrlController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    
            var repeatTimeout = null;

    var repeat = function() {
        if(repeatTimeout !== null) {
            clearTimeout(repeatTimeout);
        }
        
        repeatTimeout = setTimeout(function () {
            $scope.initiateOperation();
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

    $scope.initiateOperation = function() {
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
                var records = ndefMessage.getRecords();
                if(records.length > 0) {
                    var record = records[0];
                    var tnf = record.getTnf();
                    var typeStr = StringUtils.uint8ArrayToString(record.getType());
                    if(tnf === Ndef.Record.TNF_WELL_KNOWN &&
                       typeStr === 'U') {
                        try {
                            var resolved = Ndef.Utils.resolveUrlFromPrefix(record);
                            window.open(resolved);
                        }
                        catch (err) {

                        }
                    }
                }
                repeat();
            },function(errorType, data) {
                if(errorType === TappyClassic.ErrorTypes.APPLICATION) {
                    repeat();
                }
                ErrorDialogService.tappyErrorResponseCb(errorType,data);
            });
        }
    };
}]);
