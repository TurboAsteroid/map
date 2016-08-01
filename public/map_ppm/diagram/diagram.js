'use strict';
angular.module('diagramModule', ['ngRoute'])
    .controller('diagramController', function($scope, $http, $location, User, $routeParams, $rootScope) {
        $scope.ppm_diagram_checkbox_show = false;
        $scope.ppm_diagram_show = true;
        $scope.ppm_diagram2_show = false;
        $scope.$on('zone_click', function (event, data) {
            load_zone(data.zone);
        });

        function load_zone (zone) {
            $scope.zone = zone;
            $http({
                method: 'POST',
                url: '/api/get_diagram/',
                data: {zone: zone}
            }).then(function successCallback(response) {
                $(function () {
                    for (var i = 0; i < response.data.zones.length; i++) {
                        response.data.zones[i] = "Место " + response.data.zones[i];
                    }
                    $('#ppm_diagram').highcharts({
                        chart: {
                            type: 'bar'
                        },
                        title: {
                            text: response.data.zone_name
                        },
                        xAxis: {
                            categories: response.data.zones
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Распределение сырья, тонны'
                            }
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal',
                                events: {
                                    click: function (event) {
                                        $rootScope.$broadcast("place_click", {zone: zone, place: event.point.category});
                                    }
                                }
                            }
                        },
                        series: response.data.data
                    });
                    $('#ppm_diagram_raws').highcharts({
                        chart: {
                            type: 'bar'
                        },
                        title: {
                            text: response.data.zone_name
                        },
                        xAxis: {
                            categories: response.data.raws
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Распределение сырья, тонны'
                            }
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal',
                                events: {
                                    click: function (event) {
                                        $rootScope.$broadcast("place_click", {zone: zone, raw: event.point.category});
                                    }
                                }
                            }
                        },
                        series: response.data.data_raws
                    })
                });
                $scope.ppm_diagram_checkbox_show = true;
            }, function errorCallback(response) {
                console.log('diagram request error');
            });

            $http({
                method: 'POST',
                url: '/api/get_diagram2/',
                data: {zone: zone}
            }).then(function successCallback(response) {
                $(function () {
                    for (var i = 0; i < response.data.zones.length; i++) {
                        response.data.zones[i] = "Место " + response.data.zones[i];
                    }
                    $('#ppm_diagram2').highcharts({
                        chart: {
                            type: 'bar'
                        },
                        title: {
                            text: response.data.zone_name
                        },
                        xAxis: {
                            categories: response.data.zones
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Распределение сырья, проценты'
                            }
                        },
                        legend: {
                            enabled: true
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal',
                                events: {
                                    click: function (event) {
                                        $rootScope.$broadcast("place_click", {zone: zone, place: event.point.category});
                                    }
                                }
                            }
                        },
                        series: response.data.data
                    });
                });
                $scope.ppm_diagram_checkbox_show = true;
            }, function errorCallback(response) {
                console.log('diagram request error');
            });
        }
    });