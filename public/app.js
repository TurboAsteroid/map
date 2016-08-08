'use strict';
angular.module('appMAP', ['ngRoute', 'ngMaterial', 'authModule', 'map_ppmModule', 'LocalStorageModule'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                    templateUrl : 'auth/auth.html',
                    controller  : 'authController'
                })
            .when('/map_ppm', {
                templateUrl : 'map_ppm/map_ppm.html',
                controller  : 'map_ppmController',
                reloadOnSearch: false
            })
            .otherwise({ redirectTo: '/' });

    })
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default');
    })

    .controller('navigationController', function ($scope, $location, User) {
        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.logout = function () {
            User.reset();
            $location.path('/');
        };
    });