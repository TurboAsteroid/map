'use strict';
angular.module('tableModule', ['ngRoute', 'data-table'])
.controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService, $rootScope) {
        $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('html,body').animate({
                scrollTop: $("#datatable_anchor").offset().top
            }, 500);
        });
        $scope.toggle = function (key) {
            localStorageService.set(key, !$scope.checkVisible(key));
            var gcol = $scope.options.columns.find(function(c) {
                return c.prop === key;
            })
            gcol.className = $scope.getClass(key);
            gcol.headerClassName = $scope.getClass(key);
        };
         $scope.checkVisible = function (key) {
            return localStorageService.get(key) === false ? false : true;
        };
        $scope.getClass = function (key) {
            return localStorageService.get(key) === false ? 'hideCol' : '';
        };
        $scope.options = {
            rowHeight: 40,
            headerHeight: 40,
            footerHeight: 40,
            scrollbarV: true,
            columnMode: 'force',
            paging: {
                externalPaging: false
            },
            columns: [
                {name: "Место",prop: "place", className: $scope.getClass("place"), headerClassName: $scope.getClass("place")},
                {name: "Акт",prop: "act", className: $scope.getClass("act"), headerClassName: $scope.getClass("act")},
                {name: "Остаток на начало",prop: "balance_at_start", className: $scope.getClass("balance_at_start"), headerClassName: $scope.getClass("balance_at_start")},
                {name: "Остаток на начало ОХ",prop: "balance_at_start_OX", className: $scope.getClass("balance_at_start_OX"), headerClassName: $scope.getClass("balance_at_start_OX")},
                {name: "Остаток на начало в работу",prop: "balance_at_start_work", className: $scope.getClass("balance_at_start_work"), headerClassName: $scope.getClass("balance_at_start_work")},
                {name: "Единицы измерения",prop: "ei", className: $scope.getClass("ei"), headerClassName: $scope.getClass("ei")}
            ]
        };
        $scope.$watch(function(){
            return $rootScope.table;
        }, function(table) {
            if($routeParams.place || $routeParams.raw) {
                load_place($routeParams.svg_zone, $routeParams.place, $routeParams.raw);
            }
        });

        function load_place (zone, place, raw) {
            $rootScope.load = true;
            $http({
                method: 'POST',
                url: '/api/get_table/',
                data: {zone: zone, place: place, raw: raw}
            }).then(function successCallback(response) {
                $rootScope.load = false;
                $rootScope.table = response.data.place_name;
                $scope.table_data = response.data.data;
            }, function errorCallback(response) {
                $rootScope.load = false;
                console.log('table request error');
            });
        }

        $scope.showPrerenderedDialog = function(ev) {
            $mdDialog.show({
                controller: DialogController,
                contentElement: '#myDialogColums',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };
        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }
    });
