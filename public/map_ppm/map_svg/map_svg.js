'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Zoom, localStorageService, $compile, MapData, $http) {
        MapData.getData().then(function successCallback(response) {
            var storage_list = response.data;
            $('#legend_card_controller').empty();
            angular.forEach(storage_list.areas, function(value, key) {
                var tmp = $compile('<md-button class="legendButton legendButton_'+key+'" ng-click="show_legend_items($event,'+key+')">'+value+'</md-button>')($scope);
                $('#legend_card_controller').append(tmp);
            });
            $scope.action_legend_name = $scope.legend_name();
            $scope.showLegend = localStorageService.get("showLegend");
        });
        $scope.show_legend = function() {
            localStorageService.set("showLegend", !localStorageService.get("showLegend"));
            $scope.showLegend = localStorageService.get("showLegend");
            $scope.action_legend_name = $scope.legend_name();
        };
        $scope.legend_name = function() {
            return localStorageService.get("showLegend") === true ? "Скрыть зоны ответственности" : "Показать зоны ответственности"
        };
        $scope.show_legend_items = function($event,area_id) {
            $($event.currentTarget).toggleClass('active');
            $('#map_objects').find('[data-responsibility="'+area_id+'"]').toggleClass('active');
        };
        $scope.getWidth = function () {
            return $($element).width();
        };

        var map_block = $('#svg_map');
        map_block.height(map_block.width());
        var center = [map_block.width()/2, map_block.height() / 2];

        $(window).resize(function(){
            map_block.height(map_block.width());
            center = [map_block.width()/2, map_block.height() / 2];
        });

        $scope.zoom_map = function (new_zoom) {
            var old_transform = Zoom.get('transform');
            var new_transform = {
                x : center[0] - (center[0]*new_zoom / old_transform.k),
                y : center[1] - (center[1]*new_zoom / old_transform.k),
                k : new_zoom
            };

            var elem = d3.select("#svg_map").select("svg");
            if (!Zoom.get('zoom_obj')) {
                Zoom.set({zoom_obj: d3.zoom()});
            }
            Zoom.get('zoom_obj').scaleTo(elem, new_transform.k);
            Zoom.get('zoom_obj').translateBy(elem, new_transform.x, new_transform.y);
            Zoom.set({transform: new_transform});
        };

        $scope.zoom_lvl = 1;

        $scope.$watch(function(){
            return $scope.zoom_lvl;
        }, function(zoom) {
            $scope.zoom_map(zoom);
        });
    });