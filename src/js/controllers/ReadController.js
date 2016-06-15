app.controller("ReadController",['$scope','TappyCapabilityService',function($scope,TappyCapabilityService) {
    $scope.sidetabs = TappyCapabilityService.getDetectTabs();
}]);
