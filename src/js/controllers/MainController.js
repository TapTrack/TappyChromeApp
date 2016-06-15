app.controller("MainController",['$rootScope','$scope','$mdDialog','ErrorDialogService','StatusBarService','TappyService','$controller','TappyCapabilityService',
        function($rootScope,$scope,$mdDialog,ErrorDialogService,StatusBarService,TappyService,$controller,TappyCapabilityService) {
    $scope.scanActive = false;
    $scope.tappyConnected = false;

    var getController = function(name) {
        if(name.length > 0) {
            return $controller(name,{$scope: $scope.$new()}).constructor;
        }
        else {
            return function(){};
        }
    };


    var tabs = TappyCapabilityService.getMainCategories($scope,$controller);
    for(var i = 0; i < tabs.length; i++) {
        tabs[i].controller = getController(tabs[i].controllerName);
    }
    $scope.tabs = tabs;
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

    $scope.requestRedetect = function() {
        TappyService.startScan();        
    };

    $scope.requestDisconnect = function() {
        TappyService.disconnectTappy();
    };
    
    $scope.closeApp = function() {
        TappyService.disconnectTappy();
        // this may not be necessary
        setTimeout(function() {
            window.close();  
        },50);
    };
    
    $scope.maximizeApp = function() {
        var appWindow = chrome.app.window.current();
        if(appWindow.isMaximized()) {
            appWindow.restore();
        }
        else {
            appWindow.maximize();  
        }
    };

    $scope.minimizeApp = function() {
        chrome.app.window.current().minimize();  
    };
    
    $scope.$watch(function() {
        return TappyService.isConnected();
    },function (newVal, oldVal, scope) {
        scope.tappyConnected = TappyService.isConnected();
        $scope.tappyConnected = scope.tappyConnected;
        console.log(TappyService.isConnected());
    });
    
    $scope.$watch(function() {
        return TappyService.isScanning();
    },function (newVal, oldVal, scope) {
        scope.scanActive = TappyService.isScanning();
        $rootScope.scanActive = scope.scanActive;
        $scope.scanActive = scope.scanActive;
        console.log(TappyService.isScanning());
    });

    TappyService.startScan();
}]);
