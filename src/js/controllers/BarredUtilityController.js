app.controller("BarredUtilityController",['$scope','TappyCapabilityService',function($scope,TappyCapabilityService) {
    $scope.sidetabs = TappyCapabilityService.getUtilityTabs();
}]);
