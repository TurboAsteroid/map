'use strict';
angular.module('map_ppmController', ['ngRoute', 'ngMaterial'])
    .controller('map_ppmController', function($scope, $http, $location, User, $routeParams, $rootScope) {})
    .controller('map_svgController', function($scope, $location, $element, $rootScope) {
    })
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog) {
        $scope.place = $routeParams.place || false;
        $scope.$on('place_click', function (event, data) {
            if ($scope.place != data.place) {
                load_place(data.zone, data.place);
            }
        });

        if (!$routeParams.place) {
            return;
        }

        load_place($routeParams.place, $routeParams.place);

        function load_place (zone, place) {
            $http({
                method: 'POST',
                url: '/api/get_table/',
                data: {zone: zone, place: place}
            }).then(function successCallback(response) {
                $scope.table_name = response.data.place_name;
                $scope.table_data = response.data.data;
            }, function errorCallback(response) {
                console.log('table request error');
            });

            $scope.items = {
                incoming: {
                    name: "Приход/расход",
                    show: true
                },
                act: {
                    name: "Акт",
                    show: true
                },
                place: {
                    name: "место",
                    show: true
                },
                balance_at_start: {
                    name: "количестно на начало",
                    show: true
                },
                balance_at_start_OX: {
                    name: "количество на начало ОХ",
                    show: true
                },
                balance_at_start_work: {
                    name: "количество на начало в работу",
                    show: true
                },
                ei: {
                    name: "Единицы измерения",
                    show: true
                }
            };
        }

        $scope.toggle = function (item) {
           item.show = item.show ? false : true;
        };

        $scope.showPrerenderedDialog = function(ev) {
            $mdDialog.show({
                controller: DialogController,
                contentElement: '#myDialogColums',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };
    })
    .controller('diagramController', function($scope, $http, $location, User, $routeParams, $rootScope) {
        $scope.ppm_diagram_checkbox_show = false;
        $scope.ppm_diagram_show = true;
        $scope.ppm_diagram2_show = true;

        $scope.zone = $routeParams.zone || false;
        $scope.$on('zone_click', function (event, data) {
            if ($scope.zone != data.zone) {
                load_zone(data.zone);
            }
        });
        if (!$routeParams.zone) {
            return;
        }

        load_zone($routeParams.zone);
        function load_zone (zone) {
            $scope.zone = zone;
            $http({
                method: 'POST',
                url: '/api/get_diagram/',
                data: {zone: zone}
            }).then(function successCallback(response) {
                $(function () {
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
                        // legend: {
                        //     enabled: true
                        // },
                        plotOptions: {
                            series: {
                                stacking: 'normal',
                                events: {
                                    click: function (event) {
                                        history.pushState({}, event.point.category, '#'+$location.path()+'?place='+event.point.category);
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

            $http({
                method: 'POST',
                url: '/api/get_diagram2/',
                data: {zone: zone}
            }).then(function successCallback(response) {
                $(function () {
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
                                stacking: 'normal'
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
    })
    .directive('ghVisualization', function ($location, $rootScope) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {
                var parent = d3.select(element[0]);
                var polygon = parent.selectAll('polygon');
                polygon.on("click", function(){
                    history.pushState({}, d3.select(this).attr('id'), '#/map_ppm/'+d3.select(this).attr('id'));
                    $rootScope.$broadcast("zone_click", {zone:d3.select(this).attr('id')});
                });
            }
        }
    });


function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}