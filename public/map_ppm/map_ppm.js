'use strict';
angular.module('map_ppmController', ['ngRoute', 'ngMaterial'])
    .controller('map_ppmController', function($scope, $http, $location, User) {
    })
    .controller('map_svgController', function($scope, $http, $location, User) {
    })
    .controller('diagramController', function($scope, $http, $location, User) {
        console.log(123);
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