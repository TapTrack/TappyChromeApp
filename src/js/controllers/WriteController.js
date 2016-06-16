app.controller("WriteController",['$scope','TappyCapabilityService',function($scope,TappyCapabilityService) {
    $scope.sidetabs = TappyCapabilityService.getWriteTabs();
    $scope.$watch(function() {
        return TappyCapabilityService.getWriteTabs();
    },function (newVal, oldVal, scope) {
        $scope.sidetabs = newVal;
    },true);
}]);
