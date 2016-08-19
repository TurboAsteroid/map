'use strict';
angular.module('diagramModule', ['ngRoute'])
    .controller('diagramController', function($scope, $http, $location, User, $routeParams, $rootScope) {
        $scope.ppm_diagram_checkbox_show = false;
        $scope.ppm_diagram_show = true;
        $scope.ppm_diagram2_show = false;
        $scope.$watch(function(){
            return $rootScope.zone;
        }, function(zone) {
            if($routeParams.svg_zone) {
                load_zone($routeParams.svg_zone);
            }
        });
        function highcharts_opts(title, categories, desc, data, event_func) {
            return {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: categories
                },
                yAxis: {
                    title: {
                        text: desc
                    },
                    type: 'logarithmic'
                },
                legend: {
                    maxHeight: 60
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        events: {
                            click: event_func
                        }
                    }
                },
                tooltip: {
                    valueDecimals: 3
                },
                series: data,
                credits: {
                    enabled: false
                }
            };
        }
        function load_zone (zone) {
            $rootScope.load = true;
            $http({
                method: 'POST',
                url: '/api/get_diagram/',
                data: {zone: zone}
            }).then(function successCallback(response) {
                if (response.data.success) {
                    $rootScope.zone = $routeParams.svg_zone;
                    $rootScope.load = false;
                    $(function () {
                        if (response.data.data.length) {
                            // for (var i = 0; i < response.data.places.length; i++) {
                            //     response.data.places[i] = 'Место ' + response.data.places[i];
                            // }
                            $('#ppm_diagram').highcharts(
                                highcharts_opts(response.data.zone_name, response.data.places, 'Распределение сырья, тонны', response.data.data, function (event) {
                                    $location.search({'svg_zone': zone, 'place': event.point.category, 'raw': null});
                                    $scope.$apply();
                                })
                            );
                        } else {
                            $('#ppm_diagram').html('<h3>Нет данных</h3>');
                        }
                        if (response.data.data_raws.length) {
                            for (var i in response.data.data_raws) {
                                response.data.data_raws[i].name = 'Место ' + response.data.data_raws[i].name;
                            }
                            $('#ppm_diagram_raws').highcharts(
                                highcharts_opts(response.data.zone_name, response.data.raws, 'Распределение сырья, тонны', response.data.data_raws, function (event) {
                                    $location.search({'svg_zone': zone, 'raw': event.point.category, 'place': null});
                                    $scope.$apply();
                                })
                            )
                        } else {
                            $('#ppm_diagram_raws').html('');
                        }
                    });
                    $scope.ppm_diagram_checkbox_show = true;
                }
            }, function errorCallback(response) {
                if (!response.data.success) {
                    $rootScope.load = false;
                    console.log('diagram request error');
                }
                $location.path('/');
            });
        }
    });