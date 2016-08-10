'use strict';
angular.module('map_svgModule', ['ngRoute'])
    .controller('map_svgController', function($scope, $location, $element, Zoom, localStorageService, $compile, MapData, $http, $window) {
        MapData.getData().then(function successCallback(response) {
            var storage_list = response.data;
            $('#legend_card_controller').empty();
            angular.forEach(storage_list.areas, function(value, key) {
                var tmp = $compile('<md-button class="legendButton legendButton_'+key+'" ng-click="show_legend_items($event,'+key+')">'+value.name+'</md-button>')($scope);
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
        $scope.mapStyle = {"height": map_block.width()+'px'};
        var center = [map_block.width()/2, map_block.height() / 2];

        angular.element($window).bind('resize', function(){
            $scope.mapStyle = {"height": map_block.width()+'px'};
            center = [map_block.width()/2, map_block.height() / 2];
        });
    });