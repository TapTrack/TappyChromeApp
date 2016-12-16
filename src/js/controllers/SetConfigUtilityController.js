app.controller('SetConfigUtilityController',['$scope', '$mdDialog', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, $mdDialog, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {

    var configureEnumeration = function(enable) {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus((enable ? "Enabling" : "Disabling")+" type 2 enumeration");
            tappy.setTypeTwoEnumeration(
                    enable,
                    function() {
                        var text = "Type 2 enumeration has been "+(enable ? "enabled" : "disabled");
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title("Type 2 Enumeration")
                                .textContent(text)
                                .ok('Ok')
                        );
                        StatusBarService.setTransientStatus(text);
                    },
                    ErrorDialogService.shimErrorResponseCb);
        }

    };

    $scope.disableType2Enum = function() {
        configureEnumeration(false);
    };
    
    $scope.enableType2Enum = function() {
        configureEnumeration(true);
    };
    
    var configureDualDetection = function(enable) {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus((enable ? "Enabling" : "Disabling")+" dual-mode detection");
            tappy.setDualPolling(
                    enable,
                    function() {
                        var text = "Dual-mode detection on write has been "+(enable ? "enabled" : "disabled");
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title("Dual-mode detection")
                                .textContent(text)
                                .ok('Ok')
                        );
                        StatusBarService.setTransientStatus(text);
                    },
                    ErrorDialogService.shimErrorResponseCb);
        }

    };

    $scope.disableDualPolling = function() {
        configureDualDetection(false);
    };

    $scope.enableDualPolling = function() {
        configureDualDetection(true);
    };

}]);
