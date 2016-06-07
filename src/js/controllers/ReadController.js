app.controller("ReadController",['$scope',function($scope) {
    var SideTab = function(icon, tooltip, partial, colorStroke) {
        this.icon = icon;
        this.tooltip = tooltip;
        this.partial = partial;
        this.colorStroke = colorStroke;
    };

    $scope.sidetabs = [];

    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_nmark_optimised.svg','Read NDEF tag','/res/partials/readNdef.html',false));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_nfc.svg','Detect tag','/res/partials/scanTag.html',false));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_typeb_opt.svg','Detect Type 4B tag','/res/partials/scanType4.html',true));
}]);
