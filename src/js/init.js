var app = angular.module('cataraqui',[
        'ngMaterial',
        'pascalprecht.translate',
        'ngSanitize'
        ]);

app.decorator('$window', ['$delegate',function($delegate) {
      //Object.defineProperty($delegate, 'history', {get: () => null});
      Object.defineProperty($delegate, 'history', {get: function(){return null;}});
        return $delegate;
}]);

app.config(['$mdThemingProvider',function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');
    $mdThemingProvider.theme('dark-default','default')
        .primaryPalette('blue')
        .accentPalette('orange')
        .dark();
}]);
