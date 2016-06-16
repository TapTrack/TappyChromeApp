app.controller("MainController",['$rootScope','$scope','$mdDialog','ErrorDialogService','StatusBarService','TappyService','$controller','TappyCapabilityService','$timeout',
        function($rootScope,$scope,$mdDialog,ErrorDialogService,StatusBarService,TappyService,$controller,TappyCapabilityService,$timeout) {
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

    var debounceTime = 0;
    var updateTimeout = null;
    $scope.$watch(function() {
        return TappyCapabilityService.getMainCategories();
    },function (newVal, oldVal, scope) {
        var tabs = newVal;
        if(typeof $scope.tabs !== "undefined" &&
                $scope.tabs !== null &&
                $scope.tabs.length > tabs.length) {
            if(updateTimeout !== null) {
                $timeout.cancel(updateTimeout);
                updateTimeout = null;
            }
            updateTimeout = $timeout(function() {
                for(var i = 0; i < tabs.length; i++) {
                    tabs[i].controller = getController(tabs[i].controllerName);
                }
                $scope.tabs = tabs;
            },debounceTime);
        } else {
            if(updateTimeout !== null) {
                $timeout.cancel(updateTimeout);
                updateTimeout = null;
            }
            for(var i = 0; i < tabs.length; i++) {
                tabs[i].controller = getController(tabs[i].controllerName);
            }
            $scope.tabs = tabs;
        }
    },true);

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
        debounceTime = 500;
        TappyService.startScan();        
    };

    $scope.requestDisconnect = function() {
        debounceTime = 0;
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
    });
    
    $scope.$watch(function() {
        return TappyService.isScanning();
    },function (newVal, oldVal, scope) {
        scope.scanActive = TappyService.isScanning();
        $rootScope.scanActive = scope.scanActive;
        $scope.scanActive = scope.scanActive;
    });
    

    TappyService.startScan();
}]);
