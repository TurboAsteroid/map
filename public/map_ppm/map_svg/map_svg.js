'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Transform) {
        $scope.getWidth = function () {
            return $($element).width();
        };
        $scope.$watch($scope.getWidth, function (width) {
            $($element).height(width);
        });
        $scope.zoom_in = function () {
            var svg_group = d3.select("body").select("svg").select("g");
            Transform.set({
                x : Transform.get().x-100,
                y : Transform.get().y-100,
                k : Transform.get().k + 0.148698354997035
            });
            svg_group.attr("transform", "translate(" + Transform.get().x + "," + Transform.get().y + ") scale(" + Transform.get().k + ")");
        };
        $scope.zoom_out = function () {
            var svg_group = d3.select("body").select("svg").select("g");
            Transform.set({
                x : Transform.get().x+100,
                y : Transform.get().y+100,
                k : Transform.get().k - 0.148698354997035
            });
            svg_group.attr("transform", "translate(" + Transform.get().x + "," + Transform.get().y + ") scale(" + Transform.get().k + ")");
        };
    });