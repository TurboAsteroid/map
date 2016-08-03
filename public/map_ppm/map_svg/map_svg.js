'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Zoom) {
        $scope.getWidth = function () {
            return $($element).width();
        };
        $('#svg_map').height($('#svg_map').width());
        $(window).resize(function(){
            $('#svg_map').height($('#svg_map').width());
        });
        $scope.zoom_map = function (increase) {
            var transform = Zoom.get('transform');
            transform = {
                x : (increase ? -1 : 1) * 105,
                y : (increase ? -1 : 1) * 105,
                k : transform.k + (increase ? 1 : -1) * 0.148698354997035
            };

            var elem = d3.select("#svg_map").select("svg");
            Zoom.get('zoom_obj').scaleTo(elem, transform.k);
            Zoom.get('zoom_obj').translateBy(elem, transform.x, transform.y);
            Zoom.set({transform: transform});
        };
    });