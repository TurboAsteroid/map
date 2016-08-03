'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Zoom, localStorageService, $compile) {
        $scope.colors = {
            'polygons' : '',
            'paths': '',
            'circles': ''
        };
        $scope.activePolygons = '';
        $scope.activePaths = '';
        $scope.activeCircles = '';

        var btnhtml = '<md-button class="{{activePolygons}}" ng-click="show_legend_items(\'polygons\')">Полигоны</md-button>' +
            '<md-button class="{{activePaths}}" ng-click="show_legend_items(\'paths\')">Пути</md-button>' +
            '<md-button class="{{activeCircles}}" ng-click="show_legend_items(\'circles\')">Окружности</md-button>';
        var temp = $compile(btnhtml)($scope);
        angular.element(document.getElementById('legend_card_controller')).append(temp);
        $scope.show_legend = function(isTemplate){
            if(isTemplate) {
                $scope.showLegend = !localStorageService.get("showLegend");
                localStorageService.set("showLegend", $scope.showLegend);
                if ($scope.showLegend)
                    $scope.action_legend_name = "Свернуть легенду";
                else
                    $scope.action_legend_name = "Развернуть легенду";
            }
            else
                $scope.showLegend = localStorageService.get("showLegend");
        };
        $scope.show_legend_items = function(item_name) {
            switch(item_name) {
                case 'polygons':
                    if($scope.activePolygons == '') {
                        d3.select("svg").selectAll("polygon").style("fill", "hotpink");
                        $scope.activePolygons = 'md-raised polygons_All';
                    }
                    else {
                        d3.select("svg").selectAll("polygon").style("fill", "");
                        $scope.activePolygons = '';
                    }
                    break;
                case 'paths':
                    if($scope.activePaths == '') {
                        d3.select("svg").selectAll("path").style("fill", "lightblue");
                        $scope.activePaths = 'md-raised paths_All';
                    }
                    else {
                        d3.select("svg").selectAll("path").style("fill", "");
                        $scope.activePaths = '';
                    }
                    break;
                case 'circles':
                    if($scope.activeCircles == '') {
                        d3.select("svg").selectAll("circle").style("fill", "coral");
                        $scope.activeCircles = 'md-raised circles_All';
                    }
                    else {
                        d3.select("svg").selectAll("circle").style("fill", "");
                        $scope.activeCircles = '';
                    }
                    break;
                default:
                    break;
            }
        };
        if(localStorageService.get("showLegend") == undefined) {
            $scope.showLegend = false;
            $scope.action_legend_name = "Развернуть легенду";
        }
        else if(localStorageService.get("showLegend") == false) {
            $scope.action_legend_name = "Развернуть  легенду";
        }
        else if(localStorageService.get("showLegend") == true){
            $scope.action_legend_name = "Свернуть легенду";
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