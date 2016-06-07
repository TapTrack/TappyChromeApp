app.controller("MainController",['$rootScope','$scope','$mdDialog','ErrorDialogService','StatusBarService','TappyService','$controller',
        function($rootScope,$scope,$mdDialog,ErrorDialogService,StatusBarService,TappyService,$controller) {
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

    $scope.tabs = [
        {title: 'Detect', partial:'/res/partials/rwcontent.html', controller: getController('ReadController')},
        {title: 'Write', partial:'/res/partials/rwcontent.html', controller: getController('WriteController')},
        {title: 'Utilities', partial:'/res/partials/rwcontent.html', controller: getController('BarredUtilityController')},
    ];
    
    $scope.requestStop = function() {
        var tappy = TappyService.getTappy();

        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setTransientStatus("Sending stop command");
            tappy.sendStop();
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
    });
    
    $scope.$watch(function() {
        return TappyService.isScanning();
    },function (newVal, oldVal, scope) {
        scope.scanActive = TappyService.isScanning();
    });

    TappyService.startScan();
}]);
