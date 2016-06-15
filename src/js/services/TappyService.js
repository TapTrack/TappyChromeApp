app.factory('TappyService',['TappyClassicService','TcmpTappyService',
        function(TappyClassicService,TcmpTappyService) {
    if(BuildConfig.tappyType === "tcmp") {
        return TcmpTappyService;
    } else {
        return TappyClassicService;
    }
}]);
