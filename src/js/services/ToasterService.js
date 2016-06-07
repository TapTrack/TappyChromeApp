app.service('ToasterService',['$mdToast',function($mdToast) {
    var toastQueue = [];
    var currentToast = null;

    var launchNextToast = function() {
        if(toastQueue.length > 0) {
            var nextToast = toastQueue.shift();
            var res = function() {
                currentToast = null;
                launchNextToast();
            };
            $mdToast.show(nextToast)
                .then(res,res);
        }
    };

    this.toast = function(toast) {
        var newToast = toast
            .position('top right')
            .parent(angular.element('#mainContentTab > md-tabs-content-wrapper'));
        toastQueue.push(newToast);
        if(currentToast !== null) {
            $mdToast.hide(currentToast);
        }
        else {
            launchNextToast();
        }
    };
    
    this.briefMessage = function(msg) {
        this.toast($mdToast.simple(msg).hideDelay(1000));
    };

    this.message = function(msg) {
        this.toast($mdToast.simple(msg));
    };
}]);
