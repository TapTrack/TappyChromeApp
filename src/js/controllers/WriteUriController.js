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
            // this is kind of inefficient,
            // but it lets us use the addContent/writeContent
            // flow instead of the newer writeNdef, which isn't
            // supported by older tappies
            var fullUri = Ndef.Utils.resolveUriRecordToString($scope.ndefRecord);
            var parsed = Ndef.Utils.resolveUriToPrefix(fullUri);

            StatusBarService.setStatus("Transferring content...");
            tappy.addTextContent(
                uriSlot,
                TappyClassic.ContentSlotTypes.URI,
                parsed.prefixCode,
                parsed.content,
                function(){},
                ErrorDialogService.tappyErrorResponseCb,
                function() {
                    console.log("Initiating write content");
                    StatusBarService.setStatus("Waiting for tap...");
                    
                    var toaster = WriteMessageToasterService
                        .createToaster(
                            $scope.selectedMode.locks,
                            $scope.selectedMode.continuous); 
                    tappy.writeContentToTag(uriSlot,$scope.selectedMode.locks,function(frame) {
                        writeCount++;
                        toaster(writeCount);
                        console.log("Tag uri written");
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
                }
            );
        }
    };

}]);
