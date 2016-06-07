app.service('StatusBarService',[function() {
    var self = this;
    var resetTimeout = null;
    var defaultDisplayTime = 1000;

    this.getStatusElement = function() {
        return angular.element(document.getElementById("statusBar"));
    };
    
    this.setStatus = function(newStatus) {
        var statusElement = self.getStatusElement();
        if(statusElement !== null) {
            if(resetTimeout !== null) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }

            statusElement.text(newStatus).removeClass("hidde").addClass("showing");
        }
    };

    this.setTransientStatus = function(newStatus,timeout) {
        var statusElement = self.getStatusElement();
        if(typeof timeout === "undefined") {
            timeout = defaultDisplayTime;
        }
        if(statusElement !== null) {
            if(resetTimeout !== null) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }

            statusElement.text(newStatus).removeClass("hidde").addClass("showing");
            resetTimeout = setTimeout(function() {
                statusElement.text("").removeClass("showing").addClass("hidden");
            },timeout);
        }
    };
    
}]);
