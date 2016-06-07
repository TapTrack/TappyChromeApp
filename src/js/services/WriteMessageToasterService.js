app.service('WriteMessageToasterService',['ToasterService','StatusBarService',function(ToasterService,StatusBarService) {

    this.createToaster = function(locking, displayCount) {
        return function(writeCount) {
            var msg = "";
            if(displayCount) {
                if(writeCount == 1) {
                    msg = "Tag written";
                }
                else {
                    msg = writeCount+" tags written";
                }
            }
            else {
                msg = "Tag written";
            }

            if(locking) {
                msg += " and locked";
            }
            ToasterService.briefMessage(msg);
            StatusBarService.setTransientStatus(msg);
        };
    };
    
    this.customToast = function(msg) {
        ToasterService.briefMessage(msg);
        StatusBarService.setTransientStatus(msg);
    };
}]);
