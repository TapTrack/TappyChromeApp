app.service('ErrorDialogService',['$mdDialog','StatusBarService',function($mdDialog,StatusBarService) {
    this.noConnection = function() {
        var element = document.getElementById("tappyConnectionButton");
        var dialog = $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title("Connection Error")
                        .textContent("There doesn't appear to be a TappyUSB connected to your computer, please connect your Tappy and click the USB icon to attempt Tappy detection")
                        .ok('Ok');
        if(element === null) {
            $mdDialog.show(dialog);
        }
        else {
            element = angular.element(element);
            $mdDialog.show(
               dialog.openFrom(element)
                    .closeTo(element)
            );
        }
    };

    this.tappyErrorResponseCb = function (errorType,data) {
        var errorMessage;
        if(errorType === TappyClassic.ErrorTypes.LCS) {
            errorMessage = "Length checksum error";
        } else if (errorType === TappyClassic.ErrorTypes.DCS) {
            errorMessage = "Data checksum error";
        } else if (errorType === TappyClassic.ErrorTypes.NACK) {
            errorMessage = "Tappy replied with a NACK";
        } else if (errorType === TappyClassic.ErrorTypes.SERIAL) {
            errorMessage = "A serial communication error occured";
        } else if (errorType === TappyClassic.ErrorTypes.APPLICATION) {
            if(data.hasOwnProperty('detail')) {
                errorMessage = data.detail;
            } else {
                errorMessage = "An error occured";
            }
        } else {
            if(data.hasOwnProperty('detail')) {
                errorMessage = data.detail;
            } else {
                errorMessage = "An unknown error occured";
            }
        }
        $mdDialog.show(
            $mdDialog.alert()
                .clickOutsideToClose(true)
                .title("Tappy Error")
                .textContent(errorMessage)
                .ok('Ok')
        );
        StatusBarService.setTransientStatus(errorMessage);
    };
}]);
