app.factory('TcmpTappyService',['$rootScope','ErrorDialogService','StatusBarService','WriteMessageToasterService','TappyTcmpShim',
        function($rootScope, ErrorDialogService, StatusBarService, WriteMessageToasterService, TappyTcmpShim) {

    var tappyConnected = false;
    var scanActive = false;
    
    var setTappyConnectionStatus = function(newStatus) {
        $rootScope.$evalAsync(function(){
            tappyConnected = newStatus;   
        });
    };
    
    var tappy = null;
    var shim = null;

    // for some reason this needs to be very long on initial startup
    var tappyDetector = new TappyChromeSerialAutodetector({waitTimeout: 500});
    tappyDetector.setCallback(function(device) {
        if(tappy === null) {
            var comm = new TappyChromeSerialCommunicator(device.path);
            StatusBarService.setStatus("Tappy detected");
            var newTappy = new Tappy({communicator:comm});
            tappy = newTappy;
            shim = TappyTcmpShim.wrap(tappy);
            tappy.connect(function() {
                var isConnected = newTappy.isConnected();
                if(isConnected) {
                    WriteMessageToasterService.customToast("Tappy connected on "+device.path);
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
  /*          if(!isScanning && isScanning !== scanActive && tappy === null) {
                StatusBarService.setStatus("No tappy found");
                ErrorDialogService.noConnection();
            }*/
            console.log("isScanning: "+isScanning);
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
            tappyDetector.scan();
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
            tappy.disconnect();
            StatusBarService.setTransientStatus("Disconnecting from Tappy");
        }
        
        tappy = null; 
        shim = null;
        setTappyConnectionStatus(false);
    };

    return service;
}]);
