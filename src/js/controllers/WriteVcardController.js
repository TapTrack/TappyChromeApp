app.controller('WriteVcardController',['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService', 'TappyService','WriteMessageToasterService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    var vcardSlot = 3;

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
        },600);
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
            StatusBarService.setStatus("Transferring content...");
            var vcardTrimmed = trimVcard($scope.vcard);
            if(vcardTrimmed.url == "http://") {
                vcardTrimmed.url = "";
            }

            tappy.addVcardContent(
                vcardSlot,
                vcardTrimmed,
                function(){},
                ErrorDialogService.tappyErrorResponseCb,
                function() {
                    console.log("Initiating write content");
                    StatusBarService.setStatus("Waiting for tap...");
                    var toaster = WriteMessageToasterService
                        .createToaster(
                            $scope.selectedMode.locks,
                            $scope.selectedMode.continuous); 
                    tappy.writeContentToTag(vcardSlot,$scope.selectedMode.locks,function(frame) {
                        writeCount++;
                        console.log("Tag text written");
                        toaster(writeCount);
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
