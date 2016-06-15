app.controller('LaunchUrlController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
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

    $scope.initiateOperation = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Waiting for tap...");
            tappy.detectNdef(true,function(tagType,tagCode, ndefMessage) {
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
                },
                ErrorDialogService.shimErrorResponseCb);
        }
    };
}]);
