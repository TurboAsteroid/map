'use strict';
angular.module('map_ppmModule', ['ngRoute', 'ngMaterial', 'directivesModule', 'factoriesModule', 'tableModule', 'diagramModule', 'map_svgModule'])
    .controller('map_ppmController', function($scope, $location, $routeParams, $rootScope) {
        var place = $location.search().place;
        var raw = $location.search().raw;
        var svg_zone = $location.search().svg_zone;
        if(!place || !raw)
            $rootScope.table = false;
        else
            $rootScope.table = true;
        if(!svg_zone)
            $rootScope.zone = false;
        else
            $rootScope.zone = true;

        // var self = this;
        var filterByName = null; // optional declaration!

        bind("filterByName");

        function bind(valueName) {
            // Controller to URL
            /*$scope.$watch(function() { return self[valueName] }, function (newVal) {
             load_place($routeParams.svg_zone, $routeParams.place, $routeParams.raw);
             });*/

            // URL to controller
            $scope.$on('$locationChangeSuccess', function(event) {
                var place = $location.search().place;
                var raw = $location.search().raw;
                var zone = $location.search().svg_zone;
                if(!place || !raw)
                    $rootScope.table = false;
                else
                    $rootScope.table = true;
                $rootScope.zone = zone;
            });
        }

    });