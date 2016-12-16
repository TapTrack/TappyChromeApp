app.controller('ScanTagController',
        ['$rootScope','$scope','$sanitize','ErrorDialogService','StatusBarService','TappyService','TappyCapabilityService', 
        function($rootScope, $scope, $sanitize, ErrorDialogService, StatusBarService,TappyService,TappyCapabilityService) {
    var CardData = function(uid,description,ndef) {
        this.uid = uid;
        this.description = description;
    };

    $scope.supportsTypeOne = TappyCapabilityService.hasTypeOneScan();
    
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
            tappy.detectTag(false,function(tagType,tagCode) {
                StatusBarService.setTransientStatus("Tag read");
                $scope.$evalAsync(function(){
                    $scope.cardData = new CardData(
                        StringUtils.uint8ArrayToHexString(tagCode),
                        TappyClassic.Utils.resolveTagTypeDescription(tagType));
                });
            },function(err) {
                $scope.$evalAsync(function(){
                    $scope.clearCardData();
                });
                ErrorDialogService.shimErrorResponseCb(err);
            });
        }
    };

    $scope.scanForTagsTypeOne = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            StatusBarService.setStatus("Waiting for tap...");
            tappy.detectTagTypeOne(false,function(tagType,tagCode) {
                StatusBarService.setTransientStatus("Tag read");
                $scope.$evalAsync(function(){
                    $scope.cardData = new CardData(
                        StringUtils.uint8ArrayToHexString(tagCode),
                        TappyClassic.Utils.resolveTagTypeDescription(tagType));
                });
            },function(err) {
                $scope.$evalAsync(function(){
                    $scope.clearCardData();
                });
                ErrorDialogService.shimErrorResponseCb(err);
            });
        }
    };
    
}]);
