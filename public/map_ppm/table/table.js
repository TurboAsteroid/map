'use strict';
angular.module('tableModule', ['ngRoute'])
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService) {
        $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('html,body').animate({
                scrollTop: $("#datatable_anchor").offset().top
            }, 1000);
        });
        $scope.$on('place_click', function (event, data) {
            load_place(data.zone, data.place, data.raw);
        });
        $scope.items = {
            incoming: "Приход/расход",
            act: "Акт",
            place: "место",
            balance_at_start: "количестно на начало",
            balance_at_start_OX: "количество на начало ОХ",
            balance_at_start_work: "количество на начало в работу",
            ei: "Единицы измерения"
        };

        if($routeParams.diagram) {
            load_place($routeParams.svg_zone, $routeParams.place, $routeParams.raw);
        }

        function load_place (zone, place, raw) {
            $http({
                method: 'POST',
                url: '/api/get_table/',
                data: {zone: zone, place: place, raw: raw}
            }).then(function successCallback(response) {
                $scope.table_name = response.data.place_name;
                $scope.table_data = response.data.data;
            }, function errorCallback(response) {
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