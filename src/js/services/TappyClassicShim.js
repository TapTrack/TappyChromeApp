app.factory('TappyClassicShim',[function() {
    var StandardError = function(message,isFatal) {
        this.message = message;
        if(typeof isFatal !== "undefined") {
            this.isFatal = isFatal;
        } else {
            this.isFatal = true;
        }
        this.legacyData = {};
    };

    StandardError.prototype.setLegacyData = function(errorType,data) {
        this.legacyData.errorType = errorType;
        this.legacyData.data = data;
    };

    var generateStdErrorCb = function(fail,e) {
        return function(errorType,data) {
            var err = null;
            var isFatal = (errorType !== TappyClassic.ErrorTypes.Application);
            if(typeof data.detail !== "undefined") {
                err = new StandardError(data.detail,isFatal);
            } else {
                err = new StandardError("Unknown error occured",isFatal);
            }
            err.setLegacyData(errorType,data);
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

    var ClassicShim = function(tappy) {
        this.tappy = tappy;
        this.commandCount = 0;
    };
    
    ClassicShim.prototype = {
        disconnect: function(cb) {
            var self = this;
            self.tappy.disconnectAsap();
            // not exactly correct, but i don't think
            // this cb is used anywhere
            if(typeof cb === "function") {
                cb(); 
            }
        },

        isConnected: function() {
            var self = this;
            return self.tappy.isConnected();
        },
        setCommand: function(cmd,repeat) {
            var self = this;
            self.commandCount++;

            var cmdId = self.commandCount;

            cmd(function() {
                if(repeat) {
                    setTimeout(function() {
                        if(self.commandCount === cmdId) {
                            self.setCommand(cmd,repeat);
                        }
                    },700);
                }
            },function(e) {
                if(!e.isFatal && repeat) {
                    setTimeout(function() {
                        if(self.commandCount === cmdId) {
                            self.setCommand(cmd,repeat);
                        }
                    },250);
                } 
            });
        },

        detectNdef: function(continuous,success,fail) {
            var self = this;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var cmd = function(s,e) {
                self.tappy.readNdef(0,function(tagType, tagCode, ndefMessage) {
                    s();
                    success(tagType, tagCode, ndefMessage);
                },generateStdErrorCb(fail,e));
            };
            self.setCommand(cmd,continuous);
        },

        detectNdefTypeOne: function (continuous, success, fail) {
            throw new Error("Classic doesn't support this operation");
        },

        detectTag: function(continuous,success,fail) {
            var self = this;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var cmd = function(s,e) {
                self.tappy.readTagUid(0,true,function(tagType,tagCode) {
                    s();
                    success(tagType,tagCode);
                },generateStdErrorCb(fail,e));
            };
            self.setCommand(cmd,continuous);
        },

        detectTagTypeOne: function (continuous, success, fail) {
            throw new Error("Classic doesn't support this operation");
        },

        detectType4B: function(continuous,success,fail) {
            var self = this;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var cmd = function(s,e) {
                self.tappy.scanType4B(0,function(atqb,attrib) {
                    s();
                    success(atqb,attrib);
                },generateStdErrorCb(fail,e));
            };
            self.setCommand(cmd,continuous);
        },

        getHardwareVersion: function(success, fail) {
            throw new Error("Classic protocol doesn't support this operation");
        },

        getFirmwareVersiom: function(success, fail) {
            throw new Error("Classic protocol doesn't support this operation");
        },
        
        setDualPolling: function(enabled,success,fail) {
            throw new Error("Classic protocol doesn't support this operation");
        },
        
        setTypeTwoEnumeration: function(enabled,success,fail) {
            throw new Error("Classic protocol doesn't support this operation");
        },

        writeMirroredNdef: function(ndefBytes, lock, continuous, success, fail) {
            throw new Error("Classic protocol doesn't support this operation");
        },
        
        emulateNdef: function(ndef, timeout, maxScans, success, fail) {
            throw new Error("Classic protocol doesn't support this operation");
        },

        writeUri: function(uri,lock,continuous,success,fail) {
            var self = this;
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};

            var parsed = Ndef.Utils.resolveUriToPrefix(uri);
            var uriSlot = 0x02;
            var cmd = function(s,e) {
                self.tappy.addTextContent(
                    uriSlot,
                    TappyClassic.ContentSlotTypes.URI,
                    parsed.prefixCode,
                    parsed.content,
                    generateWriteContentSuccCb(self.tappy,uriSlot,lock,s,success,e,fail),
                    generateStdErrorCb(fail,e)
                );
            };

            self.setCommand(cmd,continuous);
        },
        writeText: function(text,lock,continuous,success,fail) {
            var self = this;
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            var textSlot = 0x01;

            var cmd = function(s,e) {
                self.tappy.addTextContent(
                    textSlot,
                    TappyClassic.ContentSlotTypes.TEXT,
                    0x00,
                    text,
                    generateWriteContentSuccCb(self.tappy,textSlot,lock,s,success,e,fail),
                    generateStdErrorCb(fail,e));
            };

            self.setCommand(cmd,continuous);
        },
        writeVcard: function(vCard,lock,continuous,success,fail) {
            var self = this;
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};

            var vCardSlot = 0x03;

            var cmd = function(s,e) {
                self.tappy.addVcardContent(
                    vCardSlot,
                    vCard,
                    generateWriteContentSuccCb(self.tappy,vCardSlot,lock,s,success,e,fail),
                    generateStdErrorCb(fail,e));
            };

            self.setCommand(cmd,continuous);
        },
        writeCustomNdef: function(ndef,lock,continuous,success,fail) {
            var self = this;
            lock = lock || false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};
            
            var cmd = function(s,e) {
                self.tappy.writeCustomNdef(0x00,lock,ndef,
                        function(tagType,tagCode) {
                            s();
                            success(tagType,tagCode);
                        },
                        generateStdErrorCb(fail,e));
            };

            self.setCommand(cmd,continuous);
        },
        lockTag: function(continuous,success,fail) {
            var self = this;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};

            var cmd = function(s,e) {
                self.tappy.lockTag(
                    0,
                    function(tagType,tagCode) {
                        s();
                        success(tagType,tagCode);
                    },generateStdErrorCb(fail,e));
            };
            this.setCommand(cmd,continuous); 
        },
        configurePlatform: function(continuous,success,fail) {
            var self = this;
            var platformSlot = 0x05;
            lock = false;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};

            var cmd = function(s,e) {
                self.tappy.readTagUid(0,false,function(tagType,tagCode) {
                    var hexTagcode = StringUtils.uint8ArrayToHexString(tagCode);
                    var url = "https://members.taptrack.com/m?id="+hexTagcode;
                    var parsed = Ndef.Utils.resolveUriToPrefix(url);
                    self.tappy.addTextContent(
                        platformSlot,
                        TappyClassic.ContentSlotTypes.URI,
                        parsed.prefixCode,
                        parsed.content,
                        function() {
                            self.tappy.writeContentToTag(platformSlot,lock,function(tagType,tagCode,locked) {
                                s();
                                success(tagType,tagCode,locked);
                            },
                            function(error,data) {
                                generateStdErrorCb(fail,e)(error,data);
                            });
                        },
                        generateStdErrorCb(fail,e)
                    );
                },generateStdErrorCb(fail,e));
            };
            this.setCommand(cmd,continuous); 
        },
        stop: function(continuous,success,fail) {
            var self = this;
            continuous = continuous || false;
            success = success || function(){};
            fail = fail || function(){};

            var cmd = function(s,e) {
                self.tappy.sendStop(function() {
                    s();
                    success();
                },generateStdErrorCb(fail,e));
            };
            this.setCommand(cmd,continuous); 
        }
    };

    return {
        wrap: function(tappy) {
            return new ClassicShim(tappy);
        }
    };

}]);
