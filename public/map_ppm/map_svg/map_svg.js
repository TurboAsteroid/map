'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Zoom, localStorageService, $compile) {
        $scope.colors = {
            'polygons' : '',
            'paths': '',
            'circles': ''
        };
        var btnhtml = '<md-button ng-click="show_legend_items(\'polygons\')">Полигоны</md-button>' +
            '<md-button ng-click="show_legend_items(\'paths\')">Пути</md-button>' +
            '<md-button ng-click="show_legend_items(\'circles\')">Окружности</md-button>';
        var temp = $compile(btnhtml)($scope);
        angular.element(document.getElementById('legend_card_controller')).append(temp);
        $scope.show_legend = function(isTemplate){
            if(isTemplate) {
                $scope.showLegend = !localStorageService.get("showLegend");
                localStorageService.set("showLegend", $scope.showLegend);
                if ($scope.showLegend)
                    $scope.action_legend_name = "Свернуть";
                else
                    $scope.action_legend_name = "Развернуть";
            }
            else
                $scope.showLegend = localStorageService.get("showLegend");
        };
        $scope.show_legend_items = function(item_name) {
            switch(item_name) {
                case 'polygons':
                    if($scope.colors.polygons == '') {
                        d3.select("svg").selectAll("polygon").style("fill", "red");
                        $scope.colors.polygons = 'red';
                    }
                    else {
                        d3.select("svg").selectAll("polygon").style("fill", "");
                        $scope.colors.polygons = '';
                    }
                    break;
                case 'paths':
                    if($scope.colors.paths == '') {
                        d3.select("svg").selectAll("path").style("fill", "yellow");
                        $scope.colors.paths = 'yellow';
                    }
                    else {
                        d3.select("svg").selectAll("path").style("fill", "");
                        $scope.colors.paths = '';
                    }
                    break;
                case 'circles':
                    if($scope.colors.circles == '') {
                        d3.select("svg").selectAll("circle").style("fill", "blue");
                        $scope.colors.circles = 'blue';
                    }
                    else {
                        d3.select("svg").selectAll("circle").style("fill", "");
                        $scope.colors.circles = '';
                    }
                    break;
                default:
                    break;
            }
        };
        if(localStorageService.get("showLegend") == undefined) {
            $scope.showLegend = false;
            $scope.action_legend_name = "Развернуть";
        }
        else if(localStorageService.get("showLegend") == false) {
            $scope.action_legend_name = "Развернуть";
        }
        else if(localStorageService.get("showLegend") == true){
            $scope.action_legend_name = "Свернуть";
            $scope.show_legend(false);
        }
        else {
            console.log("showLegend err");
        }
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