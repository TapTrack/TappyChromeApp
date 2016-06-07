app.controller('ReadNdefController',
        ['$rootScope','$scope','$sanitize','ErrorDialogService','StatusBarService','TappyService', 
        function($rootScope, $scope, $sanitize, ErrorDialogService, StatusBarService,TappyService) {
    var CardData = function(uid,description,ndef) {
        this.uid = uid;
        this.description = description;
        this.ndefRecords = ndef;
    };
   
    var SpoofRecord = function(tnf,type,payload) {
        this.getTnf = function() {
            return tnf;
        };
        
        this.getType = function() {
            return type;
        };
        
        this.getPayload = function() {
            return payload;
        };
    };

    $scope.cardData = null;
    
    $scope.clearCardData = function() {
        $scope.cardData = null;
    };

    var generateSpoofText = function() {
        var type = 'T';
        var payload = StringUtils.stringToUint8Array("enHello darkness my old friend");
        var payloadArr = new Uint8Array(payload.length + 1);
        payloadArr[0] = 2;
        payloadArr.set(payload,1);
        return new SpoofRecord(Ndef.Record.TNF_WELL_KNOWN,
                    StringUtils.stringToUint8Array(type),
                    payloadArr);

    };
    
    var generateSpoofUri = function() {
        var type = 'U';
        var parsedUri = Ndef.Utils.resolveUriToPrefix("https://www.google.com");

        var payload = StringUtils.stringToUint8Array(parsedUri.content);
        var payloadArr = new Uint8Array(parsedUri.content.length+1);
        payloadArr[0] = parsedUri.prefixCode;
        payloadArr.set(payload,1);
        return new SpoofRecord(Ndef.Record.TNF_WELL_KNOWN,
                    StringUtils.stringToUint8Array(type),
                    payloadArr);

    };

    $scope.spoofScan = function () {
        var spoofRecords = [];
        for(var i = 0; i < 5; i++) {
            if(i <= 3 && i%2 === 0) {
                spoofRecords.push(generateSpoofUri());
            }
            else {
                spoofRecords.push(generateSpoofText());
            }
        }
        
        $scope.cardData = new CardData("11223344556677","NTAG203",spoofRecords);
    };

    $scope.scanForNdef = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Waiting for tap...");
            tappy.readNdef(0,function(tagType,tagCode, ndefMessage) {
                StatusBarService.setTransientStatus("Tag read");
                $scope.$evalAsync(function(){
                    $scope.cardData = new CardData(
                        StringUtils.uint8ArrayToHexString(tagCode),
                        TappyClassic.Utils.resolveTagTypeDescription(tagType),
                        ndefMessage.getRecords());
                });
            },function(errorType, data) {
                $scope.$evalAsync(function(){
                    $scope.clearCardData();
                });
                ErrorDialogService.tappyErrorResponseCb(errorType,data);
            });
        }
    };

    $scope.describeTnf = function(ndefRecord) {
        var tnf = ndefRecord.getTnf();
        
        if(Ndef.Record.TNF_EMPTY === tnf){
            return "Empty Record";
        } else if(Ndef.Record.TNF_WELL_KNOWN === tnf){
            return "Well Known Record";
        } else if(Ndef.Record.TNF_MEDIA === tnf){
            return "Media Record";

        } else if(Ndef.Record.TNF_ABSOLUTE_URI === tnf){
            return "Absolute Record";

        } else if(Ndef.Record.TNF_EXTERNAL === tnf){
            return "External Record";

        } else if(Ndef.Record.TNF_UNKNOWN === tnf){
            return "Unknown Record";

        } else if(Ndef.Record.TNF_UNCHANGED === tnf){
            return "Unchanged Record";

        } else if(Ndef.Record.TNF_RESERVED === tnf){
            return "Reserved Record";
        }

        return "Invalid TNF";
    };
    
    $scope.describeType = function(ndefRecord) {
        var tnf = ndefRecord.getTnf();
        var typeStr = StringUtils.uint8ArrayToString(ndefRecord.getType());
        if(tnf === Ndef.Record.TNF_WELL_KNOWN) {
            if(typeStr === 'T') {
                return "Text";
            } else if (typeStr === 'U') {
                return "Uri";
            }
        }
        else if (tnf === Ndef.Record.TNF_MEDIA) {
            if(typeStr === 'text/x-vCard') {
                return "vCard";
            }
        }
        return typeStr.length > 0 ? typeStr : "Typeless";
    };
    
    var composeVcardDescription = function(vcard) {
        var description = "";
        if(vcard !== null) {
            if(typeof vcard.n === "object") {
                for(var n_i = 0; n_i < vcard.n.length; n_i++) {
                    description += "Name: "+$sanitize(vcard.n[n_i].value)+"<br/>";
                }
            }
            if(typeof vcard.title === "object") {
                for(var title_i = 0; title_i < vcard.title.length; title_i++) {
                    var titleitem = vcard.title[title_i];
                    var titletype = "Title: ";
                    description += titletype+$sanitize(titleitem.value)+"<br/>";
                }
            }
            if(typeof vcard.org === "object") {
                for(var o_i = 0; o_i < vcard.org.length; o_i++) {
                    var orgitem = vcard.org[o_i];
                    var orgtype = "Company: ";
                    description += orgtype+$sanitize(orgitem.value)+"<br/>";
                }
            }
            if(typeof vcard.email === "object") {
                for(var e_i = 0; e_i < vcard.email.length; e_i++) {
                    var emitem = vcard.email[e_i];
                    var emtype = "Email: ";
                    if(typeof emitem.meta === "object") {
                        if(typeof emitem.meta.home === "object" && emitem.meta.home !== null) {
                            emtype = "Home Email: ";
                        }
                        if(typeof emitem.meta.work === "object" && emitem.meta.work !== null) {
                            emtype = "Work Email: ";
                        }
                    }
                    description += emtype+$sanitize(emitem.value)+"<br/>";
                }
            }
            if(typeof vcard.tel === "object") {
                for(var tel_i = 0; tel_i < vcard.tel.length; tel_i++) {
                    var telitem = vcard.tel[tel_i];
                    var teltype = "Phone: ";
                    if(typeof telitem.meta === "object") {
                        if(typeof telitem.meta.home === "object" && telitem.meta.home !== null) {
                            teltype = "Home Phone: ";
                        }
                        if(typeof telitem.meta.cell === "object" && telitem.meta.cell !== null) {
                            teltype = "Cell Phone: ";
                        }
                        if(typeof telitem.meta.work === "object" && telitem.meta.work !== null) {
                            teltype = "Work Phone: ";
                        }
                    }
                    description += teltype+$sanitize(telitem.value)+"<br/>";
                }
            }
            if(typeof vcard.adr === "object") {
                for(var a_i = 0; a_i < vcard.adr.length; a_i++) {
                    var adritem = vcard.adr[a_i];
                    var adrtype = "Email: ";
                    if(typeof adritem.meta === "object") {
                        if(typeof adritem.meta.home === "object" && adritem.meta.home !== null) {
                            adrtype = "Home Address: ";
                        }
                        if(typeof adritem.meta.work === "object" && adritem.meta.work !== null) {
                            adrtype = "Work Address: ";
                        }
                    }
                    description += adrtype+$sanitize(adritem.value)+"<br/>";
                }
            }
        }
        return description;
    };

    $scope.describePayload = function(ndefRecord) {
        var tnf = ndefRecord.getTnf();
        var typeStr = StringUtils.uint8ArrayToString(ndefRecord.getType());
        var payload = ndefRecord.getPayload();
        if(tnf === Ndef.Record.TNF_WELL_KNOWN) {
            if(typeStr === 'T') {
                var langLength = payload[0];
                var contentBytes = payload.slice(langLength+1);
                var sanitizedText = $sanitize(StringUtils.uint8ArrayToString(contentBytes));
                return sanitizedText;
            } else if (typeStr === 'U') {
                try {
                    var resolvedUrl = Ndef.Utils.resolveUrlFromPrefix(ndefRecord);
                    var sanitizedUrl = $sanitize(resolvedUrl);
                    return "<a href='"+sanitizedUrl+"' target='_blank'>"+sanitizedUrl+"</a>";
                }
                catch (err) {
                    return "Unsupported URI Prefix";
                }
            }
        }
        else if (tnf === Ndef.Record.TNF_MEDIA) {
            if(typeStr === 'text/x-vCard') {
                var vcardText = StringUtils.uint8ArrayToString(payload);
                var card = vCard.parse(vcardText);
                return composeVcardDescription(card);
            }
        }

        return ByteWordWrap.insertBreakPoints(StringUtils.uint8ArrayToHexString(payload));
    };

    $scope.getAvatarSvg = function(ndefRecord) {
        var tnf = ndefRecord.getTnf();
        var typeStr = StringUtils.uint8ArrayToString(ndefRecord.getType());
        var svgPre = "/res/img/svg/";
        if(tnf === Ndef.Record.TNF_WELL_KNOWN) {
            if(typeStr === 'T') {
                return svgPre+"ic_description.svg";
            } else if (typeStr === 'U') {
                return svgPre+"ic_link.svg";
            }
        }
        else if (tnf === Ndef.Record.TNF_MEDIA) {
            if(typeStr === 'text/x-vCard') {
                return svgPre+"ic_person.svg";
            }
        }
        return svgPre+"ic_help_outline.svg";
    };
}]);
