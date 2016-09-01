'use strict';
angular.module('map_ppmModule', ['ngRoute', 'ngMaterial', 'directivesModule', 'factoriesModule', 'tableModule', 'diagramModule', 'map_svgModule'])
    .controller('map_ppmController', function($scope, $location, $routeParams, $rootScope, $http, localStorageService, TableData) {
        $http({
            method: 'GET',
            url: '/api/is'
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
            $location.path('/');
        });
        $scope.act = "";
        var place = $location.search().place;
        var raw = $location.search().raw;
        var zone = $location.search().svg_zone;
        var date = $location.search().date;
        $rootScope.table = raw || place;
        $rootScope.date = date;
        $rootScope.raw = raw;
        $rootScope.zone = zone;

        $rootScope.$on('$locationChangeSuccess', function(event) {
            var place = $location.search().place;
            var raw = $location.search().raw;
            var zone = $location.search().svg_zone;
            var date = $location.search().date;
            $rootScope.table = raw || place;
            $rootScope.date = date;
            $rootScope.raw = raw;
            $rootScope.zone = zone;
        });

        Highcharts.setOptions({
            lang: {
                loading: 'Загрузка...',
                months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
                shortMonths: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
                exportButtonTitle: "Экспорт",
                printButtonTitle: "Печать",
                rangeSelectorFrom: "С",
                rangeSelectorTo: "По",
                rangeSelectorZoom: "Период",
                downloadPNG: 'Скачать PNG',
                downloadJPEG: 'Скачать JPEG',
                downloadPDF: 'Скачать PDF',
                downloadSVG: 'Скачать SVG',
                printChart: 'Напечатать график',
                resetZoom: 'Сбросить увеличение',
                drillUpText: 'Назад к {series.name}'
            }
        });

        $scope.search_act = function () {
            if($scope.act != "" && $scope.act != undefined && $scope.act != null && ($scope.act.length > 2)) {
                $location.search().timestamp = "1472705824744";
                $http({
                    method: 'post',
                    url: '/api/search',
                    data: {search_act: $scope.act, timestamp: parseInt($location.search().timestamp)}
                }).then(function successCallback(response) {
                    if (response.data.success) {
                        TableData.set(response.data.results);
                        $rootScope.act = response.data.act;
                    }
                }, function errorCallback(response) {
                    if (!response.data.success) {
                        $rootScope.load = false;
                        console.log('search_act request error');
                    }
                    $location.path('/');
                });
            }
            else {
                TableData.set({});
                $rootScope.act = $scope.act;
            }
        }
    });