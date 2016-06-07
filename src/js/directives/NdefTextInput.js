app.directive('ndefTextInput', [function() {
    return {
        restrict: 'E',
        templateUrl: '/res/partials/directiveTextInput.html',
        scope: {
            record: '=',
            recordUpdated: '=?'
        },
        controller: ['$scope','$element',function($scope,$element) {
            $scope.recordUpdated= angular.isDefined($scope.recordUpdated) ? $scope.recordUpdated : function(){};
            var extracted = Ndef.Utils.resolveTextRecord($scope.record);
            $scope.contentText = extracted.content;
            
            $scope.textChange = function() {
                $scope.record = Ndef.Utils.createTextRecord($scope.contentText,"en");
                $scope.recordUpdated($scope.record);
            };
        

        }]
    };
}]);
