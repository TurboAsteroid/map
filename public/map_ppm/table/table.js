'use strict';
angular.module('tableModule', ['ngRoute', 'data-table'])
.controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService, $rootScope) {
        $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('html,body').animate({
                scrollTop: $("#datatable_anchor").offset().top
            }, 500);
        });
        $scope.options = {
            rowHeight: 40,
            headerHeight: 40,
            footerHeight: 40,
            scrollbarV: true,
            columnMode: 'force',
            paging: {
                externalPaging: false
            }
        };
        $scope.items = {
            incoming: "Приход/расход",
            act: "Акт",
            place: "Место",
            balance_at_start: "Количестно на начало",
            balance_at_start_OX: "Количество на начало ОХ",
            balance_at_start_work: "Количество на начало в работу",
            ei: "Единицы измерения"
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

        $scope.toggle = function (key) {
            localStorageService.set(key, $scope.checkVisible(key) ? 'false' : 'true');
        };
        $scope.checkVisible = function (key) {
            return localStorageService.get(key) === 'false' ? false : true;
        };

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
