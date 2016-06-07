app.controller('PlatformUploadController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    var platformSlot = 4;
    var repeatTimeout = null;

    var repeat = function() {
        if(repeatTimeout !== null) {
            clearTimeout(repeatTimeout);
        }
        
        repeatTimeout = setTimeout(function () {
            $scope.sendWrite();
        },1000);
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
            if(repeatTimeout !== null) {
                clearTimeout(repeatTimeout);
            }

            tappy.readTagUid(
                    0x00,
                    false,
                    function(tagType, tagCode) {
                        var hexTagcode = StringUtils.uint8ArrayToHexString(tagCode);
                        var url = "https://members.taptrack.com/m?id="+hexTagcode;
                        var launchUrl = "https://members.taptrack.com/x.php?tag_code="+hexTagcode;
                        var parsed = Ndef.Utils.resolveUriToPrefix(url);
                        tappy.addTextContent(
                            platformSlot,
                            TappyClassic.ContentSlotTypes.URI,
                            parsed.prefixCode,
                            parsed.content,
                            function(){},
                            ErrorDialogService.tappyErrorResponseCb,
                            function() {
                                console.log("Initiating write content");
                                StatusBarService.setStatus("Waiting for tap...");
                                var toaster = WriteMessageToasterService.createToaster(false,true);
                                tappy.writeContentToTag(platformSlot,false,function(frame) {
                                    writeCount++;
                                    toaster(writeCount);
                                    window.open(launchUrl);
                                    repeat();
                                },function(errorType,data) {
                                    if(errorType === TappyClassic.ErrorTypes.APPLICATION) {
                                        repeat();
                                    }
                                    ErrorDialogService.tappyErrorResponseCb(errorType,data);
                                },function() {
                                });
                            });
                    },
                    function(errorType, data) {
                        if(errorType === TappyClassic.ErrorTypes.APPLICATION) {
                            repeat();
                        }
                        ErrorDialogService.tappyErrorResponseCb(errorType,data);
                    });
        }
    };
}]);
