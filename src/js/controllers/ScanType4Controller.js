app.controller('ScanType4Controller',
        ['$rootScope','$scope','$sanitize','ErrorDialogService','StatusBarService','TappyService', 
        function($rootScope, $scope, $sanitize, ErrorDialogService, StatusBarService,TappyService) {
    var CardDataA = function(uid,ats) {
        this.uid = uid;
        this.ats = ats;
        this.type = 'A';
    };

    var CardDataB = function(atqb,attrib) {
        this.atqb = atqb;
        this.attrib = attrib;
        this.type = 'B';
    };

    $scope.pollTypeA = false;
    
    $scope.cardData = null;
    
    $scope.clearCardData = function() {
        $scope.cardData = null;
    };

    $scope.setTypeA = function() {
        $scope.pollTypeA = true;
    };

    $scope.setTypeB = function() {
        $scope.pollTypeA = false;
    };

    var noneRepl = function(str) {
        if(str.length === 0) {
            return "None provided";
        }
        else {
            return ByteWordWrap.insertBreakPoints(str);
        }
    };

    var scanType4A = function(tappy) {

    };

    var scanType4B = function(tappy) {
            StatusBarService.setStatus("Waiting for tap...");
            tappy.scanType4B(0,function(atqb,attrib) {
                StatusBarService.setTransientStatus("Tag read");
                $scope.$evalAsync(function(){
                    $scope.cardData = new CardDataB(
                        noneRepl(StringUtils.uint8ArrayToHexString(atqb)),
                        noneRepl(StringUtils.uint8ArrayToHexString(attrib)));
                });
            },function(errorType, data) {
                $scope.$evalAsync(function(){
                    $scope.clearCardData();
                });
                ErrorDialogService.tappyErrorResponseCb(errorType,data);
            });
    };

    $scope.scanForTags = function() {
        var tappy = TappyService.getTappy();
        if(tappy === null || !tappy.isConnected()) {
            ErrorDialogService.noConnection();
        }
        else {
            if($scope.pollTypeA) {
                scanType4A(tappy);
            }
            else {
                scanType4B(tappy);
            }
        }
    };

    
}]);
