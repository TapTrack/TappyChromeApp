app.factory('TappyTcmpShim',[function() {
    var StandardErrorMessage = function(message,isFatal) {
        this.message = message;
        if(typeof isFatal !== "undefined") {
            this.isFatal = isFatal;
        } else {
            this.isFatal = true;
        }
        this.tcmpMsg = {};
    };

    StandardErrorMessage.prototype.setTcmpMessage = function(msg) {
        this.tcmpMsg = msg;
    };

    var generateStdErrorCb = function(fail,e) {
        return function(msg) {
            var err = null;
            var isFatal = true;

            if(typeof msg.getErrorMessage === "function") {
                err = new StandardErrorMessage(msg.getErrorMessage(),isFatal);
            }
            else {
                err = new StandardErrorMessage("An error occured",isFatal);
            }
            err.setTcmpMessage(msg);
            e(err);
            fail(err);
        };
    };

    var generateWriteContentSuccCb = function(tappy,slot,lock,s,success,e,fail) {
        return function() {
            tappy.writeContentToTag(slot,lock,function(tagType,tagCode,locked) {
                s();
                success(tagType,tagCode,locked);
            },
            function(error,data) {
                generateStdErrorCb(fail,e)(error,data);
            });
        };
    };

    var ResolverMux = function(resolvers) {
        this.resolvers = resolvers;
    };

    ResolverMux.prototype.checkFamily = function(cmd) {
        var self = this;
        var supported = false;
        for(var i = 0; i < self.resolvers.length; i++) {
            supported = supported || self.resolvers[i].checkFamily(cmd);
        }
        return supported;
    };

    ResolverMux.prototype.resolveCommand = function(cmd) {
        var self = this;
        for(var i = 0; i < self.resolvers.length; i++) {
            var resolver = self.resolvers[i];
            if(resolver.checkFamily(cmd)) {
                return resolver.resolveCommand(cmd);
            }
        }
        throw new Error("Unsupported command type");
    };
    
    ResolverMux.prototype.resolveResponse = function(cmd) {
        var self = this;
        for(var i = 0; i < self.resolvers.length; i++) {
            var resolver = self.resolvers[i];
            if(resolver.checkFamily(cmd)) {
                return resolver.resolveResponse(cmd);
            }
        }
        throw new Error("Unsupported response type");
    };

    var System = TappySystemFamily;
    var BasicNfc = TappyBasicNfcFamily;

    var TcmpShim = function(tappy) {
        var self = this;
        this.tappy = tappy;
        this.resolver = new ResolverMux(
                [new TappyBasicNfcFamily.Resolver(),
                new TappySystemFamily.Resolver()]);

        this.currentSuccessCb = function(){};
        this.currentFailCb = function(){};
        this.delayTimeout = null;

        this.tappy.setMessageListener(function(msg) {
            if(self.resolver.checkFamily(msg)) {
                var resolved = null;
                try {
                    resolved = self.resolver.resolveResponse(msg);
                } catch (err) {
                    self.currentFailCb(new StandardErrorMessage("Unsupported response",false));
                }
                if(resolved !== null) {
                    self.currentSuccessCb(resolved);
                }
            } else {
                self.currentFailCb(new StandardErrorMessage("Response received from unsupported command family",false));
            }

        });

        this.tappy.setErrorListener(function(errorType) {
            if(errorType === Tappy.ErrorType.NOT_CONNECTED) {
                self.currentFailCb(new StandardErrorMessage("Tappy not connected",true));
            } else if (errorType === Tappy.ErrorType.INVALID_HDLC) {
                self.currentFailCb(new StandardErrorMessage("Invalid packet received",true));
            } else if (errorType === Tappy.ErrorType.INVALID_TCMP) {
                self.currentFailCb(new StandardErrorMessage("Invalid message received",true));
            } else if (errorType === Tappy.ErrorType.CONNECTION_ERROR) {
                self.currentFailCb(new StandardErrorMessage("Tappy communication error",true));
            } else {
                self.currentFailCb(new StandardErrorMessage("Unknown communication error",true));
            }
        });
    };

    var genSuccessCb = function(filter,success,fail) {
        return function(msg) {
            if(BasicNfc.Responses.ApplicationError.isTypeOf(msg)) {
                fail(new StandardErrorMessage(msg.getErrorMessage(),true));
            } else if (System.Responses.SystemError.isTypeOf(msg)) {
                fail(new StandardErrorMessage(msg.getErrorMessage(),true));
            } else if (System.Responses.LcsMismatch.isTypeOf(msg) || 
                    System.Responses.LengthMismatch.isTypeOf(msg) ||
                    System.Responses.ImproperMessageFormat.isTypeOf(msg) ||
                    System.Responses.CrcMismatch.isTypeOf(msg)) {
                fail(new StandardErrorMessage("Communication error",true));
            } else if (BasicNfc.Responses.ScanTimeout.isTypeOf(msg)) {
                fail(new StandardErrorMessage("Scan timeout",true));
            } else if (filter(msg)) {
                success(msg);
            } 
            console.log("Message ignored");
            console.log(msg);
        };
    };

    var genFailCb = function(fail) {
        return function(error) {
            fail(error);
        };
    };

    TcmpShim.prototype = {
        disconnect: function(cb) {
            var self = this;
            self.tappy.disconnect();
        },

        executeDelayed: function(func) {
            var self = this;
            if(self.delayTimeout !== null) {
                clearTimeout(self.delayTimeout);
                self.delayTimeout = null;
            }

            self.delayTimeout = setTimeout(function() {
                func();
            },500);
        },

        clearCallbacks: function() {
            var self = this;
            if(self.delayTimeout !== null) {
                clearTimeout(self.delayTimeout);
                self.delayTimeout = null;
            }
            self.currentSuccessCb = function() {};
            self.currentFailCb = function(){};
        },

        sendMsg: function(msg,success,fail) {
            var self = this;
            self.currentSuccessCb = success;
            self.currentFailCb = fail;
            self.tappy.sendMessage(msg);
        },

        isConnected: function() {
            var self = this;
            return self.tappy.isConnected();
        },

        detectNdef: function(continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var msg = null;
            if(continuous) {
                msg = new BasicNfc.Commands.StreamNdef(0x00,BasicNfc.PollingModes.GENERAL);
            } else {
                msg = new BasicNfc.Commands.ScanNdef(0x00,BasicNfc.PollingModes.GENERAL);
            }
            
            var failCb = genFailCb(fail);
            var successCb = genSuccessCb(BasicNfc.Responses.NdefFound.isTypeOf,function(msg){
                    var tagType = msg.getTagType(); 
                    var tagCode = msg.getTagCode();
                    var rawNdefMessage = msg.getMessage();
                    var parsedNdefMessage = null;
                    try {
                        parsedNdefMessage = Ndef.Message.fromBytes(rawNdefMessage);
                    } catch (err) {
                        failCb(new StandardErrorMessage("Invalid NDEF message received",false));
                        return;
                    }
                    success(tagType,tagCode,parsedNdefMessage);
            },failCb);
            self.sendMsg(msg,successCb,failCb);
        },

        detectTag: function(continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var msg = null;
            if(continuous) {
                msg = new BasicNfc.Commands.StreamTags(0x00,BasicNfc.PollingModes.GENERAL);
            } else {
                msg = new BasicNfc.Commands.ScanTag(0x00,BasicNfc.PollingModes.GENERAL);
            }
            
            var failCb = genFailCb(fail);
            var successCb = genSuccessCb(BasicNfc.Responses.TagFound.isTypeOf,function(msg){
                    var tagType = msg.getTagType(); 
                    var tagCode = msg.getTagCode();
                    success(tagType,tagCode);
            },failCb);
            self.sendMsg(msg,successCb,failCb);
        },

        detectType4B: function(continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            self.clearCallbacks();
            fail(new StandardErrorMessage("This Tappy does not support this operation",true)); 
        },

        writeUri: function(uri,lock,continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var parsed = Ndef.Utils.resolveUriToPrefix(uri);
            var msg = new BasicNfc.Commands.WriteNdefUri(0,lock,parsed.content,parsed.prefixCode);
           
            var wrappedSuccess = function(tagType,tagCode) {
                success(tagType,tagCode);
                if(continuous) {
                    self.executeDelayed(function() {
                        self.writeUri(uri,lock,continuous,success,fail);
                    });
                }
            };

            var failCb = genFailCb(fail);
            var successCb = genSuccessCb(BasicNfc.Responses.TagWritten.isTypeOf,function(msg){
                    var tagType = msg.getTagType(); 
                    var tagCode = msg.getTagCode();
                    wrappedSuccess(tagType,tagCode);
            },failCb);
            self.sendMsg(msg,successCb,failCb);
        },

        writeText: function(text,lock,continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var msg = new BasicNfc.Commands.WriteNdefText(0,lock,text);
           
            var wrappedSuccess = function(tagType,tagCode) {
                success(tagType,tagCode);
                if(continuous) {
                    self.executeDelayed(function() {
                        self.writeText(text,lock,continuous,success,fail);
                    });
                }
            };

            var failCb = genFailCb(fail);
            var successCb = genSuccessCb(BasicNfc.Responses.TagWritten.isTypeOf,function(msg){
                    var tagType = msg.getTagType(); 
                    var tagCode = msg.getTagCode();
                    wrappedSuccess(tagType,tagCode);
            },failCb);
            self.sendMsg(msg,successCb,failCb);
        },
/*
        Tappy.TappyVcard = function() {
            this.name = "";
            this.cellPhone = "";
            this.workPhone = "";
            this.homePhone = "";
            this.personalEmail = "";
            this.businessEmail = "";
            this.homeAddress = "";
            this.workAddress = "";
            this.company = "";
            this.title = "";
            this.url = "";
        };
*/
        writeVcard: function(vcard,lock,continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
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
            var msg = new Ndef.Message([record]);
            var msgBytes = msg.toByteArray();

            self.writeCustomNdef(msgBytes,lock,continuous,success,fail);
        },

        writeCustomNdef: function(ndef,lock,continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var msg = new BasicNfc.Commands.WriteNdefCustom(0,lock,ndef);
           
            var wrappedSuccess = function(tagType,tagCode) {
                success(tagType,tagCode);
                if(continuous) {
                    self.executeDelayed(function() {
                        self.writeCustomNdef(ndef,lock,continuous,success,fail);
                    });
                }
            };

            var failCb = genFailCb(fail);
            var successCb = genSuccessCb(BasicNfc.Responses.TagWritten.isTypeOf,function(msg){
                    var tagType = msg.getTagType(); 
                    var tagCode = msg.getTagCode();
                    wrappedSuccess(tagType,tagCode);
            },failCb);
            self.sendMsg(msg,successCb,failCb);
        },

        lockTag: function(continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var lockMsg = new BasicNfc.Commands.LockTag(0x00);
            var failCb = genFailCb(fail);
            
            var successCb = genSuccessCb(BasicNfc.Responses.TagLocked.isTypeOf,function(msg){
                    var tagType = msg.getTagType(); 
                    var tagCode = msg.getTagCode();
                    success(tagType,tagCode);
                    if(continuous) {
                        self.executeDelayed(function() {
                            self.lockTag(continuous,success,fail);
                        });
                    }
            },failCb);
            self.sendMsg(lockMsg,successCb,failCb);
        },

        configurePlatform: function(continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            var lock = false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var readMsg = new BasicNfc.Commands.ScanTag(0x00,BasicNfc.PollingModes.GENERAL);
            
            var readFailCb = genFailCb(fail);
            var readSuccessCb = genSuccessCb(BasicNfc.Responses.TagFound.isTypeOf,function(msg){
                var tagType = msg.getTagType(); 
                var tagCode = msg.getTagCode();
                
                var hexTagcode = StringUtils.uint8ArrayToHexString(tagCode);
                var url = "https://members.taptrack.com/m?id="+hexTagcode;
                var parsed = Ndef.Utils.resolveUriToPrefix(url);
                
                var writeMsg = new BasicNfc.Commands.WriteNdefUri(0,lock,parsed.content,parsed.prefixCode);
               
                var wrappedSuccess = function(tagType,tagCode) {
                    success(tagType,tagCode);
                    if(continuous) {
                        self.executeDelayed(function() {
                            self.configurePlatform(continuous,success,fail);
                        });
                    }
                };

                var writeFailCb = genFailCb(fail);
                var writeSuccessCb = genSuccessCb(BasicNfc.Responses.TagWritten.isTypeOf,function(msg){
                        var tagType = msg.getTagType(); 
                        var tagCode = msg.getTagCode();
                        wrappedSuccess(tagType,tagCode);
                },writeFailCb);
                self.sendMsg(writeMsg,writeSuccessCb,writeFailCb);
            },readFailCb);
            
            self.sendMsg(readMsg,readSuccessCb,readFailCb);
        },
        stop: function(continuous,success,fail) {
            var self = this;
            self.clearCallbacks();
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var msg = new BasicNfc.Commands.Stop();
            
            var failCb = genFailCb(fail);
            var successCb = genSuccessCb(function(){return true;},function(msg){
                    success();
            },failCb);
            self.sendMsg(msg,successCb,failCb);
        }
    };
    
    return {
        wrap: function(tappy) {
            return new TcmpShim(tappy);
        }
    };
}]);
