'use strict';
angular.module('map_ppmModule', ['ngRoute', 'ngMaterial', 'directivesModule', 'factoriesModule', 'tableModule', 'diagramModule', 'map_svgModule', 'search_by_actModule'])
    .controller('map_ppmController', function($scope, $location, $routeParams, $rootScope, $http, TableData) {
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


        $http({
            method: 'POST',
            url: '/api/get_times/',
            data: {zone: zone, place: place, raw: raw, date: date}
        }).then(function successCallback(response) {
            var dates = response.data.dates;
            $scope.myDate = $routeParams.date ? new Date(parseInt($routeParams.date)) : new Date(parseInt(response.data.lastDate));
            var tmp_dates = {};
            for (var d in dates) {
                if (!tmp_dates[dates[d].year+'-'+dates[d].months+'-'+dates[d].day] || tmp_dates[dates[d].year+'-'+dates[d].months+'-'+dates[d].day].timestamp < dates[d].timestamp) {
                    tmp_dates[dates[d].year+'-'+dates[d].months+'-'+dates[d].day] = dates[d];

                    if (
                        $scope.myDate.getFullYear() == dates[d].year &&
                        $scope.myDate.getMonth()+1 == dates[d].month &&
                        $scope.myDate.getDate() == dates[d].day
                    ) {
                        $scope.currentDate = dates[d].timestamp;
                    }
                }
            }
            $scope.dayDayts = [];
            for (var d in tmp_dates) {
                $scope.dayDayts.push({timestamp:tmp_dates[d].timestamp, date: tmp_dates[d].day+'-'+tmp_dates[d].month+'-'+tmp_dates[d].year});
            }

            // console.log($scope.currentDate, new Date($scope.currentDate));

            $scope.currentTime = $scope.myDate.getTime();
            $scope.getTimes(dates);
            $scope.dateChanged = function(){
                $scope.getTimes(dates);
            };
        }, function errorCallback(response) {
            if (!response.data.success) {
                $rootScope.load = false;
                console.log('times request error');
            }
            $location.path('/');
        });

        $scope.timeChanged = function(){
            var search = $routeParams;
            search.date = $scope.currentTime;
            $location.search(search);
        };
        $scope.getTimes = function(dates){
            $scope.dayTimes = [];
            $scope.currentTime = 0;
            for (var d in dates) {
                if (
                    $scope.myDate.getFullYear() == dates[d].year &&
                    $scope.myDate.getMonth()+1 == dates[d].month &&
                    $scope.myDate.getDate() == dates[d].day
                ) {
                    $scope.dayTimes.push({
                        time: dates[d].hour + ':' + dates[d].mins,
                        timestamp: dates[d].timestamp
                    });
                }
            }
            $scope.timeChanged();
        };

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
            if($scope.act != undefined || $scope.act != null)
                var act = $scope.act.toString();
            else
                var act = "";
            if(act != "" && act != undefined && act != null && (act.length > 2)) {
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
                $rootScope.act = act;
            }
        }
    });