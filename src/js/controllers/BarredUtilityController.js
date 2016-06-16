app.controller("BarredUtilityController",['$scope','TappyCapabilityService',function($scope,TappyCapabilityService) {
    $scope.sidetabs = TappyCapabilityService.getUtilityTabs();
    $scope.$watch(function() {
        return TappyCapabilityService.getUtilityTabs();
    },function (newVal, oldVal, scope) {
        $scope.sidetabs = newVal;
    },true);
}]);
