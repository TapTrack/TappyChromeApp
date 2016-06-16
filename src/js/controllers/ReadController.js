app.controller("ReadController",['$scope','TappyCapabilityService',function($scope,TappyCapabilityService) {
    $scope.sidetabs = TappyCapabilityService.getDetectTabs();
    $scope.$watch(function() {
        return TappyCapabilityService.getDetectTabs();
    },function (newVal, oldVal, scope) {
        $scope.sidetabs = newVal;
    },true);
}]);
