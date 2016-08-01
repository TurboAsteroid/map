'use strict';
var appMAP = angular.module('appMAP', ['ngRoute',
                                        'ngMaterial',
                                        'authController',
                                        'map_ppmController',
                                        'LocalStorageModule']);

appMAP.config(function($routeProvider) {
    $routeProvider
        .when('/', {
                templateUrl : 'auth/auth.html',
                controller  : 'authController'
            })
        .when('/map_ppm', {
            templateUrl : 'map_ppm/map_ppm.html',
            controller  : 'map_ppmController'
        })
        .when('/map_ppm/:zone', {
            templateUrl: 'map_ppm/map_ppm.html',
            controller: 'map_ppmController'
        })
        .otherwise({ redirectTo: '/' });

});

appMAP.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default');
});

appMAP.controller('navigationController', function ($scope, $location, User) {

    $scope.go = function (path) {
        $location.path(path);
    };

    $scope.logout = function () {
        User.reset();
        $location.path('/');
    };
});

appMAP.factory('User', function() {
    var user_var = {
        'username' : null,
        'password' : null,
        'tokenUser' : null,
        'tokenPassword' : null
    };
    return {
        set: function(new_user_var) {
            user_var = new_user_var;
        },
        get: function() {
            return user_var;
        },
        reset: function() {
            user_var = {
                'username' : null,
                'password' : null,
                'tokenUser' : null,
                'tokenPassword' : null
            };
            return true;
        }
    };
});