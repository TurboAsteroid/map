'use strict';
angular.module('map_ppmModule', ['ngRoute', 'ngMaterial', 'directivesModule', 'factoriesModule', 'tableModule', 'diagramModule', 'map_svgModule'])
    .controller('map_ppmController', function($scope, $location, $routeParams, $rootScope, $http) {
        $http({
            method: 'GET',
            url: '/api/is'
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
            $location.path('/');
        });

        var place = $location.search().place;
        var raw = $location.search().raw;
        var zone = $location.search().svg_zone;
        $rootScope.table = raw || place;
        $rootScope.raw = raw;
        $rootScope.zone = zone;

        $rootScope.$on('$locationChangeSuccess', function(event) {
            var place = $location.search().place;
            var raw = $location.search().raw;
            var zone = $location.search().svg_zone;
            $rootScope.table = raw || place;
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
    });