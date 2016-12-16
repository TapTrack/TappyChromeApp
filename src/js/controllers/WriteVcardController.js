app.controller('WriteVcardController',['$rootScope','$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService', 'TappyService','WriteMessageToasterService','TappyCapabilityService',
        function($rootScope, $scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService,TappyCapabilityService) {
    var vcardSlot = 3;

    $scope.selectedMode = WriteModeService.getDefaultMode();
    $scope.writeModes = WriteModeService.getModes();
    $scope.supportsEmulation = TappyCapabilityService.supportsEmulation();
    
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
     /*       var content = "";
            if(typeof $scope.writeTextContent !== "undefined") {
                content = $scope.writeTextContent.trim();
           }*/
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

    $scope.requestEmulate = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        } else {
            StatusBarService.setStatus("Waiting for tap...");
            var vcardTrimmed = trimVcard($scope.vcard);
            if(vcardTrimmed.url == "http://") {
                vcardTrimmed.url = "";
            }
            var record = $scope.composeVcardRecord(vcardTrimmed);
            var msg = new Ndef.Message([record]);
            
            StatusBarService.setTransientStatus("Starting emulation");
            tappy.emulateNdef(msg.toByteArray(),function() {
                WriteMessageToasterService.customToast("Emulated Tag Scanned");
            },function(err) {
                tappy.stop();
                ErrorDialogService.shimErrorResponseCb(err);
            });
        }
    };
    
    $scope.composeVcardRecord = function(vcard) {
        var emptyVcard = new TappyClassic.TappyVcard();
        var finalVcard = vcard || {};
        for (var opt in emptyVcard) {
            if (emptyVcard.hasOwnProperty(opt) && !finalVcard.hasOwnProperty(opt)) {
                finalVcard[opt] = emptyVcard[opt];
            }
        }
        
        var card = {};

        if(finalVcard.name.length > 0) {
            card.n = [
                {
                    value: finalVcard.name
                }
            ];
        }
        if(finalVcard.company.length > 0) {
            card.org = [
                {
                    value: finalVcard.company
                }
            ];
        }
        if(finalVcard.cellPhone.length > 0 || 
                finalVcard.homePhone.length > 0 ||
                finalVcard.workPhone.length > 0) {
            card.tel = [];
            if(finalVcard.cellPhone.length > 0) {
                card.tel.push({
                    value: finalVcard.cellPhone,
                    meta: {type: 'CELL'}
                });
            }

            if(finalVcard.homePhone.length > 0) {
                card.tel.push({
                    value: finalVcard.homePhone,
                    meta: {type: 'HOME'}
                });
            }

            if(finalVcard.workPhone.length > 0) {
                card.tel.push({
                    value: finalVcard.workPhone,
                    meta: {type: 'WORK'}
                });
            }
        }

        if(finalVcard.personalEmail.length > 0 || 
                finalVcard.businessEmail.length > 0) {

            card.email = [];
            if(finalVcard.personalEmail.length > 0) {
                card.email.push({
                    value: finalVcard.personalEmail,
                    meta: {type: 'HOME'}
                });
            }
            
            if(finalVcard.businessEmail.length > 0) {
                card.email.push({
                    value: finalVcard.businessEmail,
                    meta: {type: 'WORK'}
                });
            }
        }
        
        if(finalVcard.homeAddress.length > 0 || 
                finalVcard.workAddress.length > 0) {

            card.adr = [];
            if(finalVcard.homeAddress.length > 0) {
                card.adr.push({
                    value: finalVcard.homeAddress,
                    meta: {type: 'HOME'}
                });
            }
            
            if(finalVcard.workAddress.length > 0) {
                card.adr.push({
                    value: finalVcard.workAddress,
                    meta: {type: 'WORK'}
                });
            }
        }

        if(finalVcard.url.length > 0) {
            card.url = [{
                value: finalVcard.url
            }];
        }
        
        if(finalVcard.title.length > 0) {
            card.title = [{
                value: finalVcard.title
            }];
        }

        var stringVcard = vCard.generate(card);
        var vcardBytes = StringUtils.stringToUint8Array(stringVcard);
        var typeBytes = StringUtils.stringToUint8Array("text/x-vcard");
        var record = new Ndef.Record(false,Ndef.Record.TNF_MEDIA,typeBytes,null,vcardBytes);
        return record;
    };
}]);
