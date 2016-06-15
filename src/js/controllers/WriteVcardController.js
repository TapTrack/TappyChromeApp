app.controller('WriteVcardController',['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService', 'TappyService','WriteMessageToasterService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    var vcardSlot = 3;

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

    $scope.resetVcard = function() {
        $scope.vcard = new TappyClassic.TappyVcard();
        $scope.vcard.url = "http://";
    };
    
    $scope.resetVcard();

    var trimVcard = function(vcard) {
        var trimmed = new TappyClassic.TappyVcard();
        for(var key in trimmed) {
            if(typeof vcard[key] === "string") {
                trimmed[key] = vcard[key].trim();
            }
            else {
                trimmed[key] = "";
            }
        }

        return trimmed;
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
            var vcardTrimmed = trimVcard($scope.vcard);
            if(vcardTrimmed.url == "http://") {
                vcardTrimmed.url = "";
            }

            var toaster = WriteMessageToasterService
                .createToaster(
                    $scope.selectedMode.locks,
                    $scope.selectedMode.continuous); 
            tappy.writeVcard(
                vcardTrimmed,
                $scope.selectedMode.locks,
                $scope.selectedMode.continuous,
                function() {
                        writeCount++;
                        toaster(writeCount);
                        StatusBarService.setTransientStatus("Tag Written");
                },ErrorDialogService.shimErrorResponseCb);
        }
    };
}]);
