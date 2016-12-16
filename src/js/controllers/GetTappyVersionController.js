app.controller('GetTappyVersionController',['$scope', 'ErrorDialogService','StatusBarService', 'WriteModeService','TappyService','WriteMessageToasterService',
        function($scope, ErrorDialogService, StatusBarService, WriteModeService, TappyService, WriteMessageToasterService) {
    $scope.firmwareVersion = null;
    $scope.hardwareVersion = null;

    $scope.initiateOperation = function() {
        $scope.clearInformation();
        $scope.getFirmwareVersion();
    };

    $scope.clearInformation = function() {
        $scope.firmwareVersion = null;
        $scope.hardwareVersion = null;
    };
    var errorFn = function(err) {
        $scope.$evalAsync(function(){
            $scope.clearInformation();
        });
        ErrorDialogService.shimErrorResponseCb(err);
    };

    $scope.getFirmwareVersion = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Requsting firmware version");
            tappy.getFirmwareVersion(
                    function(majorVersion,minorVersion) {
                        $scope.$evalAsync(function(){
                            $scope.firmwareVersion = ""+majorVersion+"."+minorVersion;
                        });
                        $scope.getHardwareVersion();
                    },
                    errorFn);
        }
    };

    $scope.getHardwareVersion = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Requsting hardware version");
            tappy.getHardwareVersion(
                    function(majorVersion,minorVersion) {
                        $scope.$evalAsync(function(){
                            $scope.hardwareVersion = ""+majorVersion+"."+minorVersion;
                        });
                        StatusBarService.setTransientStatus("Hardware Version: "+$scope.hardwareVersion+", Firmware Version: "+$scope.firmwareVersion);
                    },
                    errorFn);
        }
    };

}]);
