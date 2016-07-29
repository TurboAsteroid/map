'use strict';
angular.module('map_ppmController', ['ngRoute', 'ngMaterial'])
    .controller('map_ppmController', function($scope, $http, $location, User, $routeParams, $rootScope) {})
    .controller('map_svgController', function($scope, $location, $element, $rootScope) {
        $scope.getWidth = function () {
            return $($element).width();
        };
        $scope.$watch($scope.getWidth, function (width) {
            $($element).height(width);
        });
    })
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService) {
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
                incoming: "Приход/расход",
                act: "Акт",
                place: "место",
                balance_at_start: "количестно на начало",
                balance_at_start_OX: "количество на начало ОХ",
                balance_at_start_work: "количество на начало в работу",
                ei: "Единицы измерения"
            };
        }

        $scope.toggle = function (key) {
            localStorageService.set(key, $scope.checkVisible(key) ? 'false' : 'true');
        };
        $scope.checkVisible = function (key) {
            return localStorageService.get(key) === 'false' ? false : true;
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
            if (data.zone!=$scope.zone) {
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
        }
    })
    .directive('ghVisualization', function ($location, $rootScope) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {
                var parent = d3.select(element[0]);
                var polygon = parent.selectAll('polygon');
                polygon.each(function() {
                    this.id = "Склад " + (Math.floor((Math.random() * 100) + 1));
                });
                var tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("padding", "10px")
                    .style("background", "#fff")
                    .style("border", "1px solid #ccc")
                    .style("border-radius", "7px");
                polygon
                    .on("mouseover", function(){
                        tooltip.text(this.id);
                        return tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", function(){
                        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                    })
                    .on("mouseout", function(){
                        return tooltip.style("visibility", "hidden");
                    })
                    .on("click", function(){
                        tooltip.style("visibility", "hidden");
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