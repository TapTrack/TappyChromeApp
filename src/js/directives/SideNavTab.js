app.directive('sideNavTabs', ['$compile',function($compile) {
    return {
        restrict: 'E',
        templateUrl: '/res/partials/sidetabpage.html',
        scope: {
            sidetabs: '=',
        },
        controller: ['$scope','$element',function($scope,$element) {
            $scope.selectedIdx = 0;
            $scope.tabSelected = function(idx) {
                $scope.selectedIdx = idx;
            };

            $scope.getPartial = function(idx) {
                var tab = $scope.sidetabs[idx];
                if(typeof tab !== "undefined" && tab !== null) {
                    return tab.partial;
                } else {
                    return "";
                }
            };
        

        }]
    };
}]);
