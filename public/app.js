'use strict';
angular.module('appMAP', ['ngRoute', 'ngMaterial', 'authModule', 'map_ppmModule', 'search_by_actModule', 'LocalStorageModule'])
    .config(function($routeProvider, $mdDateLocaleProvider) {
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
        $mdDateLocaleProvider.formatDate = function(date) {
            date = new Date(date);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();

            return day + "-" + month + "-" + year;
        };
        $mdDateLocaleProvider.months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        $mdDateLocaleProvider.shortMonths = ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'];
        $mdDateLocaleProvider.days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        $mdDateLocaleProvider.shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб' ];
    })
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default');
    })

    .controller('navigationController', function ($scope, $location) {
        $scope.go = function (path) {
            $location.path(path);
        };
        $scope.logout = function () {
            $http({
                method: 'GET',
                url: '/api/logout'
            }).then(function successCallback(response) {
                if (response.data.success) {
                    $rootScope.load = false;
                    $location.path('/');
                }
            }, function errorCallback(response) {
                if (!response.data.success) {
                    $rootScope.load = false;
                    console.log('logout error');
                    $location.path('/');
                }
            });
        };
    });