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
            .when('/map_ppm/:zone', {
                templateUrl: 'map_ppm/map_ppm.html',
                controller: 'map_ppmController'
            })
            .otherwise({ redirectTo: '/' });

    })
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default');
    })

    .controller('navigationController', function ($scope, $location, Logged) {
        if(!Logged.get())
            $location.path('/');

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.logout = function () {
            $http({
                method: 'GET',
                url: '/api/logout'
            }).then(function successCallback(response) {
                if (response.data.success) {
                    Logged.set(false);
                    $rootScope.load = false;
                    $location.path('/');
                }
            }, function errorCallback(response) {
                if (!response.data.success) {
                    Logged.set(false);
                    $rootScope.load = false;
                    $location.path('/');
                    console.log('logout error');
                }
            });
        };

        // $scope.$watch(function(){
        //     return Logged.get();
        // }, function(l) {
        //     if(!l)
        //         $location.path('/');
        // });

        $scope.$watch(function(){
            return Logged.get();
        }, function(l){
            if(!l)
                $location.path('/');
        });
    });