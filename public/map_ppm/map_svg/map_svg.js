'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Zoom, localStorageService, $compile) {
        $scope.colors = {
            'polygons' : '',
            'paths': '',
            'circles': ''
        };

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
                    if($scope.colors.polygons == '') {
                        d3.select("svg").selectAll("polygon").style("fill", "red");
                        $scope.colors.polygons = 'red';
                        $scope.activePolygons = 'md-raised md-primary';
                    }
                    else {
                        d3.select("svg").selectAll("polygon").style("fill", "");
                        $scope.colors.polygons = '';
                        $scope.activePolygons = '';
                    }
                    break;
                case 'paths':
                    if($scope.colors.paths == '') {
                        d3.select("svg").selectAll("path").style("fill", "yellow");
                        $scope.colors.paths = 'yellow';
                        $scope.activePaths = 'md-raised md-primary';
                    }
                    else {
                        d3.select("svg").selectAll("path").style("fill", "");
                        $scope.colors.paths = '';
                        $scope.activePaths = '';
                    }
                    break;
                case 'circles':
                    if($scope.colors.circles == '') {
                        d3.select("svg").selectAll("circle").style("fill", "blue");
                        $scope.colors.circles = 'blue';
                        $scope.activeCircles = 'md-raised md-primary';
                    }
                    else {
                        d3.select("svg").selectAll("circle").style("fill", "");
                        $scope.colors.circles = '';
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


        $scope.zoom_map = function (new_zoom) {
            var transform = Zoom.get('transform');
            transform = {
                x : transform.x,
                y : transform.y,
                k : new_zoom
            };

            var elem = d3.select("#svg_map").select("svg");
            if (!Zoom.get('zoom_obj')) {
                Zoom.set({zoom_obj: d3.zoom()});
            }
            Zoom.get('zoom_obj').scaleTo(elem, transform.k);
            Zoom.set({transform: transform});
        }

        $scope.zoom_lvl = 1;

        $scope.$watch(function(){
            return $scope.zoom_lvl;
        }, function(zone) {
            $scope.zoom_map($scope.zoom_lvl);
        });
    });