'use strict';
angular.module('map_ppmController', ['ngRoute', 'ngMaterial'])
    .controller('map_ppmController', function($scope, $http, $location, User) {
    })
    .controller('map_svgController', function($scope, $http, $location, User) {
    })
    .controller('tableController', function($scope, $http, $location, User, $routeParams) {
        if (!$routeParams.place) {
            return;
        }

    })
    .controller('diagramController', function($scope, $http, $location, User, $routeParams) {
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
                        categories: response.data.zones,
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Распределение сырья'
                        },
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
        }, function errorCallback(response) {
            console.log('diagram request error');
        });
    })
    .directive('ghVisualization', ['$location', function (location) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {

                var parent = d3.select(element[0]);
                var polygon;
                d3.xml("resourses/elem.svg",  function(error, xml) {
                    if (error) throw error;
                    var importedNode = document.importNode(xml.documentElement, true);
                    parent
                        .each(function() {
                            this.appendChild(importedNode);
                        });
                    polygon = parent.selectAll('polygon');
                    polygon.on("click", function(){
                        location.path('/map_ppm/'+d3.select(this).attr('id'));
                        scope.$apply();
                    });
                })
            }
        }
    }]);