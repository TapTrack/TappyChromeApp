app.factory('TappyClassicService',['$rootScope','ErrorDialogService','StatusBarService','WriteMessageToasterService','TappyClassicShim',
        function($rootScope, ErrorDialogService, StatusBarService, WriteMessageToasterService,TappyClassicShim) {

    var tappyConnected = false;
    var scanActive = false;
    
    var setTappyConnectionStatus = function(newStatus) {
        $rootScope.$evalAsync(function(){
            tappyConnected = newStatus;   
        });
    };
    
    var tappy = null; 
    var shim = null;

    var tappyDetector = new TappyClassic.Autodetector();
    tappyDetector.setCallback(function(device) {
        if(tappy === null) {
            StatusBarService.setStatus("Tappy detected");
            var newTappy = new TappyClassic(device.path);
            tappy = newTappy;
            shim = TappyClassicShim.wrap(tappy);
            tappy.connect(function() {
                var isConnected = newTappy.isConnected();
                if(isConnected) {
                    WriteMessageToasterService.customToast("Tappy connected on "+tappy.path);
                }
                else {
                    WriteMessageToasterService.customToast("Tappy connection failed");
                }
                
                setTappyConnectionStatus(isConnected);
            });
        }
    });

    tappyDetector.setStatusCallback(function(isScanning) {
        $rootScope.$evalAsync(function(){
            scanActive = isScanning;
            if(!isScanning && tappy === null) {
                StatusBarService.setStatus("No tappy found");
                ErrorDialogService.noConnection();
            }
        });
    });
   
    var service = {};

    service.isConnected = function() {
        return tappyConnected;
    };

    service.isScanning = function() {
        return scanActive;
    };

    service.startScan = function() {
        if(tappy !== null) {
            service.disconnectTappy();
        }
        // this timeout was necessary for some reason that i cant recall
        setTimeout(function() {
            StatusBarService.setStatus("Searching for Tappy");
            tappyDetector.startScan();
        },2);
    };

    service.getTappy = function() {
        return shim;
    };
    
    service.getBackingTappy = function() {
        return tappy;
    };

    service.disconnectTappy = function() {
        if(tappy !== null) {
            tappy.disconnectAsap();
            StatusBarService.setTransientStatus("Disconnecting from Tappy");
        }
        
        tappy = null;
        shim = null;
        setTappyConnectionStatus(false);
    };

    return service;
    
}]);
