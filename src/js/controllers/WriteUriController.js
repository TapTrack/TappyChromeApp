app.controller('WriteUriController',['$rootScope','$scope', '$mdDialog','ErrorDialogService','StatusBarService','WriteModeService','TappyService','WriteMessageToasterService',
        function($rootScope, $scope, $mdDialog, ErrorDialogService, StatusBarService, WriteModeService,TappyService, WriteMessageToasterService) {
    
    $scope.ndefRecord = Ndef.Utils.createUriRecord("http://");

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

    $scope.sendWrite = function() {
        var tappy = TappyService.getTappy();

        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            // this is kind of inefficient,
            // but it lets us use the addContent/writeContent
            // flow instead of the newer writeNdef, which isn't
            // supported by older tappies
            var fullUri = Ndef.Utils.resolveUriRecordToString($scope.ndefRecord);

            var toaster = WriteMessageToasterService
                .createToaster(
                    $scope.selectedMode.locks,
                    $scope.selectedMode.continuous); 
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
    };

}]);
