app.controller("BarredUtilityController",['$scope',function($scope) {
    var SideTab = function(icon, tooltip, partial, colorStroke) {
        this.icon = icon;
        this.tooltip = tooltip;
        this.partial = partial;
        this.colorStroke = colorStroke;
    };

    $scope.sidetabs = [];

    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_open_in_browser.svg','Launch URLs','/res/partials/openUrlUtilityItem.html',false));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_lock.svg','Lock tags','/res/partials/lockTagUtilityItem.html',false));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_cloud_upload.svg','Configure for TapTrack Platform','/res/partials/platformUploadUtilityItem.html',false));
}]);
