app.controller('ScanTagController',
        ['$rootScope','$scope','$sanitize','ErrorDialogService','StatusBarService','TappyService', 
        function($rootScope, $scope, $sanitize, ErrorDialogService, StatusBarService,TappyService) {
    var CardData = function(uid,description,ndef) {
        this.uid = uid;
        this.description = description;
    };
    
    $scope.cardData = null;
    
    $scope.clearCardData = function() {
        $scope.cardData = null;
    };

    $scope.scanForTags = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Waiting for tap...");
            tappy.readTagUid(0,true,function(tagType,tagCode) {
                StatusBarService.setTransientStatus("Tag read");
                $scope.$evalAsync(function(){
                    $scope.cardData = new CardData(
                        StringUtils.uint8ArrayToHexString(tagCode),
                        TappyClassic.Utils.resolveTagTypeDescription(tagType));
                });
            },function(errorType, data) {
                $scope.$evalAsync(function(){
                    $scope.clearCardData();
                });
                ErrorDialogService.tappyErrorResponseCb(errorType,data);
            });
        }
    };
    
}]);
