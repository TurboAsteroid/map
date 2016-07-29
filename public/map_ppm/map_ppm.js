'use strict';
angular.module('map_ppmController', ['ngRoute', 'ngMaterial'])
    .controller('map_ppmController', function($scope, $http, $location, User) {
    })
    .controller('map_svgController', function($scope, $location, $element) {
        // d3.select()








        // $scope.clickonmap = function($event){
        //     if ($event.target.tagName != "polygon") {
        //         return;
        //     }
        //     $location.path('/map_ppm/'+angular.element($event.target).attr('id'));
        // }
    })
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog) {
        if (!$routeParams.place) {
            return;
        }
        $http({
            method: 'POST',
            url: '/api/get_table/',
            data: {zone: $routeParams.zone, place: $routeParams.place}
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
    .controller('diagramController', function($scope, $http, $location, User, $routeParams) {
        $scope.ppm_diagram_checkbox_show = false;
        $scope.ppm_diagram_show = true;
        $scope.ppm_diagram2_show = true;

        if (!$routeParams.zone) {
            return;
        }
        $http({
            method: 'POST',
            url: '/api/get_diagram/',
            data: {zone: $routeParams.zone}
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
                                    $location.search("place="+event.point.category);
                                    $scope.$apply();

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
            data: {zone: $routeParams.zone}
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
    })
    .directive('ghVisualization', ['$location', function (location) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {
                var parent = d3.select(element[0]);
                var polygon = parent.selectAll('polygon');
                polygon.on("click", function(){
                    location.path('/map_ppm/'+d3.select(this).attr('id'));
                    scope.$apply();
                });
            }
        }
    }]);


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