app.factory('TappyService',['$rootScope','$mdDialog','WriteMessageToasterService','StatusBarService','TappyTcmpShim','TappyClassicShim',
        function($rootScope,$mdDialog,WriteMessageToasterService,StatusBarService,TappyTcmpShim,TappyClassicShim) {
    var shimmedTappy = null;
    var shimType = "none";
    
    var tappyConnected = false;
    var classicScanActive = false;
    var tcmpScanActive = false;

    var hasPlatformInfo = false;
    var isMac = false;
    var startScanOnPlatformReturn = false;

    var tcmpDevices = [];
    var classicDevices = [];
   

    var setTappyConnectionStatus = function(newStatus) {
        $rootScope.$evalAsync(function(){
            tappyConnected = newStatus;   
        });
    };

    var unsafeConnectTcmp = function(tDevice) {
        var comm = new TappyChromeSerialCommunicator(tDevice.path);
        StatusBarService.setStatus("Tappy detected");
        var newTcmpTappy = new Tappy({communicator:comm});
        shimmedTappy = TappyTcmpShim.wrap(newTcmpTappy);
        shimType = "tcmp";
        StatusBarService.setTransientStatus("Connecting to Tappyon "+tDevice.path);
        newTcmpTappy.connect(function() {
            var isConnected = newTcmpTappy.isConnected();
            if(isConnected) {
                WriteMessageToasterService.customToast("Tappy connected on "+tDevice.path);
            } else {
                WriteMessageToasterService.customToast("Tappy connection failed");
            }
            
            setTappyConnectionStatus(isConnected);
        });
    };

    var unsafeConnectClassic = function(cDevice) {
        var newClTappy = new TappyClassic(cDevice.path);
        shimmedTappy = TappyClassicShim.wrap(newClTappy);
        shimType = "classic";
        StatusBarService.setTransientStatus("Connecting to Tappy Classic on "+cDevice.path);
        newClTappy.connect(function() {
            var isConnected = newClTappy.isConnected();
            if(isConnected) {
                WriteMessageToasterService.customToast("Tappy Classic connected on "+cDevice.path);
            } else {
                WriteMessageToasterService.customToast("Tappy Classic connection failed");
            }
            
            setTappyConnectionStatus(isConnected);
        });
    };

    var handleResults = function() {
        if(shimmedTappy === null) {
            var totalDevices = tcmpDevices.length + classicDevices.length;
            if(totalDevices > 1) {
                var tappyOptions = [];
                for(var tI = 0; tI < tcmpDevices.length; tI++) {
                    var tcmpDev = tcmpDevices[tI];
                    tcmpDev.isTcmp = true;
                    tappyOptions.push(tcmpDev);
                }
                for(var cI = 0; cI < classicDevices.length; cI++) {
                    var classicDev = classicDevices[cI];
                    classicDev.isTcmp = false;
                    tappyOptions.push(classicDev);
                }
                var locs = {
                    deviceOptions: tappyOptions
                };
                var selector = $mdDialog.alert({
                    templateUrl: "/res/partials/tappySelectorDialog.html",
                    locals: locs,
                    controller: ['$scope','deviceOptions','$mdDialog',function($scope,deviceOptions,$mdDialog){
                        console.log(deviceOptions);
                        $scope.deviceOptions = deviceOptions;
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.tappySelected = function(device) {
                            $mdDialog.hide(device);
                        };
                    }]
                });
                $mdDialog.show(selector).then(function(device) {
                    if(device.isTcmp) {
                        unsafeConnectTcmp(device);
                    } else {
                        unsafeConnectClassic(device);
                    }
                },function() {
                    StatusBarService.setTransientStatus("No Tappy selected");
                });
            } else if (totalDevices === 1) {
                if(tcmpDevices.length > 0) {
                    unsafeConnectTcmp(tcmpDevices[0]);
                } else {
                    unsafeConnectClassic(classicDevices[0]);
                }
            } else {
                WriteMessageToasterService.customToast("No Tappy found");
                StatusBarService.setTransientStatus("No Tappy found");
            }
        }
    };
    
    // for some reason this needs to be very long on initial startup
    var tcmpDetector= new TappyChromeSerialAutodetector({waitTimeout: 450});
    tcmpDetector.setCallback(function(device) {
        tcmpDevices.push(device);
    });
    
    tcmpDetector.setStatusCallback(function(isScanning) {
        $rootScope.$evalAsync(function(){
            tcmpScanActive = isScanning;
            if(!isScanning) {
                handleResults();
            }
        });
    });
   
    var continueScanning = false;

    var classicDetector = new TappyClassic.Autodetector();
    classicDetector.setCallback(function(device) {
        classicDevices.push(device);
    });

    classicDetector.setStatusCallback(function(isScanning) {
        $rootScope.$evalAsync(function(){
            classicScanActive = isScanning;
            if(!isScanning && continueScanning) {
                tcmpDetector.scan();
            }
        });
    });

    var startCombinedScan = function() {
        if(hasPlatformInfo) {
            // Some macOS computers seem to have problems
            // when the TCMP scan is preceeded by the Classic
            // scan, but the exact cause of this is unknown.
            // For now, we just avoid the Classic scan in order
            // to allow those computers to still use this utility. 
            //
            // Note: Restarting auto-detection fails on those
            // devices as well
            if(isMac) {
                continueScanning = true;
                startScanOnPlatformReturn = false;
                tcmpDetector.scan();
            } else {
                continueScanning = true;
                startScanOnPlatformReturn = false;
                classicDetector.startScan();
            }
        } else {
            startScanOnPlatformReturn = true;
        }
    };

    var stopCombinedScan = function() {
        continueScanning = false;
        startScanOnPlatformReturn = false;
        classicDetector.cancelScan();
        tcmpDetector.stop();
    };

    var service = {};
    service.getTappyType = function() {
        if(shimmedTappy === null) {
            return "none";
        } else {
            return shimType;
        }
    };
    
    service.isConnected = function() {
        return tappyConnected;
    };

    service.isScanning = function() {
        return classicScanActive && tcmpScanActive;
    };

    service.startScan = function() {
        if(shimmedTappy !== null) {
            service.disconnectTappy();
        }
        stopCombinedScan();
        classicDevices = [];
        tcmpDevices = [];
        // this timeout was necessary for some reason that i cant recall
        setTimeout(function() {
            StatusBarService.setStatus("Searching for Tappy");
            startCombinedScan();
        },2);
    };

    service.getTappy = function() {
        return shimmedTappy;
    };
    
    service.disconnectTappy = function() {
        if(shimmedTappy !== null) {
            shimmedTappy.disconnect();
            StatusBarService.setTransientStatus("Disconnecting from Tappy");
        }
        
        shimmedTappy = null;
        setTappyConnectionStatus(false);
    };

    chrome.runtime.getPlatformInfo(function(platformInfo) {
        isMac = platformInfo.os == "linux";
        hasPlatformInfo = true;
        if(startScanOnPlatformReturn) {
            service.startScan();
        }
    });
    return service;
}]);
