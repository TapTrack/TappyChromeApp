app.service('TappyService',['$rootScope','ErrorDialogService','StatusBarService','WriteMessageToasterService',
        function($rootScope, ErrorDialogService, StatusBarService, WriteMessageToasterService) {

    var tappyConnected = false;
    var scanActive = false;
    
    var setTappyConnectionStatus = function(newStatus) {
        $rootScope.$evalAsync(function(){
            $rootScope.tappyConnected = newStatus;   
        });
    };
    
    var tappy = null; 

    var tappyDetector = new TappyClassic.Autodetector();
    tappyDetector.setCallback(function(device) {
        if(tappy === null) {
            StatusBarService.setStatus("Tappy detected");
            var newTappy = new TappyClassic(device.path);
            tappy = newTappy;
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
            $rootScope.scanActive = isScanning;
            if(!isScanning && tappy === null) {
                StatusBarService.setStatus("No tappy found");
                ErrorDialogService.noConnection();
            }
        });
    });
    
    this.isConnected = function() {
        return $rootScope.tappyConnected;
    };

    this.isScanning = function() {
        return $rootScope.scanActive;
    };

    this.startScan = function() {
        if(tappy !== null) {
            this.disconnectTappy();
        }
        // this timeout was necessary for some reason that i cant recall
        setTimeout(function() {
            StatusBarService.setStatus("Searching for Tappy");
            tappyDetector.startScan();
        },2);
    };

    this.getTappy = function() {
        return tappy;
    };

    this.disconnectTappy = function() {
        if(tappy !== null) {
            tappy.disconnectAsap();
            StatusBarService.setTransientStatus("Disconnecting from Tappy");
        }
        
        tappy = null; 
        setTappyConnectionStatus(false);
    };
    
}]);
