app.controller("WriteController",['$scope','TappyCapabilityService',function($scope,TappyCapabilityService) {
    $scope.sidetabs = TappyCapabilityService.getWriteTabs();
}]);
