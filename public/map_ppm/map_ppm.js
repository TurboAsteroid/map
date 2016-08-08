'use strict';
angular.module('map_ppmModule', ['ngRoute', 'ngMaterial', 'directivesModule', 'factoriesModule', 'tableModule', 'diagramModule', 'map_svgModule'])
    .controller('map_ppmController', function($scope, $location, $routeParams, $rootScope, $http) {
        $http({
            method: 'GET',
            url: '/api/is'
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
            $location.path('/');
        });

        var place = $location.search().place;
        var raw = $location.search().raw;
        var zone = $location.search().svg_zone;
        $rootScope.table = raw || place;
        $rootScope.zone = zone;

        $rootScope.$on('$locationChangeSuccess', function(event) {
            var place = $location.search().place;
            var raw = $location.search().raw;
            var zone = $location.search().svg_zone;
            $rootScope.table = raw || place;
            $rootScope.zone = zone;
        });
    });