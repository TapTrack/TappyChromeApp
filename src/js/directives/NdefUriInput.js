app.directive('ndefUriInput', [function() {
    return {
        restrict: 'E',
        templateUrl: '/res/partials/directiveUriInput.html',
        scope: {
            record: '=',
            splitInitially: '@?',
            recordUpdated: '=?'
        },
        controller: ['$scope','$element','$mdDialog',function($scope,$element,$mdDialog) {
            $scope.fullUri = Ndef.Utils.resolveUriRecordToString($scope.record);

            var parsed = Ndef.Utils.resolveUriString($scope.fullUri);

            //$scope.splitInitially = angular.isDefined($scope.splitInitially) ? $scope.splitInitially : false;
            $scope.splitInitially = angular.isDefined($scope.splitInitially) ? $scope.splitInitially == "true": false;
            $scope.recordUpdated= angular.isDefined($scope.recordUpdated) ? $scope.recordUpdated : function(){};

            if($scope.splitInitially) {
                $scope.prefixText = parsed.prefix;
                $scope.contentText = parsed.content;
            }
            else {
                $scope.prefixText = "";
                $scope.contentText = $scope.fullUri;
            }

            $scope.urlKeydown = function(e) {
                var t = e.target;
                // determine if the cursor is at the start of the input
                // and only at the start (ie this will be false if the 
                // user is deleting a block of text that happens to end
                // at the start
                var isAtStart = t.selectionStart === 0 && t.selectionStart === t.selectionEnd;

                //put the prefix back in the input when backspaced at start
                if(isAtStart && e.keyCode === 8) {
                    e.preventDefault();
                    $scope.prefixText = "";
                    $scope.contentText = $scope.fullUri; 
                }
            };

            $scope.urlKeypress = function(e) {
                var parsed = Ndef.Utils.resolveUriString($scope.fullUri);
                var t = e.target;

                // is the prefix in the input and the user currently editing it?
                var isInPrefix = $scope.prefixText.length === 0 && 
                    e.target.selectionStart < parsed.prefix.length;
                if(!isInPrefix) {
                    $scope.prefixText = parsed.prefix;
                    $scope.contentText = parsed.content;
                }
            };

            $scope.urlChange = function(e) {
                $scope.fullUri = $scope.prefixText+$scope.contentText;
                $scope.record = Ndef.Utils.createUriRecord($scope.fullUri);
                $scope.recordUpdated($scope.record);
            };
        
            $scope.explainNdefPrefix = function() {
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title("NDEF Prefix")
                        .htmlContent("NDEF URL records use a prefix code in order to save memory on the tag."+
                            " The portion of your URL displayed in the 'NDEF Prefix' area will be encoded with a single byte."+
                            " If you want to learn more, TapTrack has written "+
                            " <a href='http://www.taptrack.com/ndef-url-record-prefixes' target='_blank'>whitepaper</a>"+
                            " about how NDEF URL prefixes save space on tags.")
                        .ok('Got it')
                );
            };

        }]
    };
}]);
