app.controller("WriteController",['$scope',function($scope) {
    var SideTab = function(icon, tooltip, partial) {
        this.icon = icon;
        this.tooltip = tooltip;
        this.partial = partial;
    };

    $scope.sidetabs = [];

    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_link.svg','Single URI record','/res/partials/writeUri.html'));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_description.svg','Single text record','/res/partials/writeText.html'));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_person.svg','Single vCard record','/res/partials/writeVcard.html'));
    $scope.sidetabs.push(new SideTab('/res/img/svg/ic_list.svg','Multi-record message','/res/partials/writeMultiRecord.html'));
}]);
