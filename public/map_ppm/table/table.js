'use strict';
angular.module('tableModule', ['ngRoute'])
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService, $rootScope, $compile) {
        $scope.sortType     = false;
        $scope.sortReverse  = false;
        $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('html,body').animate({
                scrollTop: $("#datatable_anchor").offset().top
            }, 500);
            calculate_thead();
        });

        function calculate_thead() {
            var old_thead = $('#place_datatable thead:not(.duplicate_thead)');
            var new_thead = $('#place_datatable thead.duplicate_thead');
            old_thead.find('th').each(function () {
                var ind = old_thead.find('th').index(this);
                new_thead.find('th').filter(':eq('+ind+')').add($(this)).css({width: $(this).width()})
            });
        }
        $('#place_datatable').scroll(function () {
            $(this).find('thead.duplicate_thead').show().css('top', $(this).scrollTop());
        });

        $scope.items = {
            act: "Акт",
            place: "место",
            balance_at_start: "количестно на начало",
            balance_at_start_OX: "количество на начало ОХ",
            balance_at_start_work: "количество на начало в работу",
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
                console.log("response1", response);
                $rootScope.load = false;
                $rootScope.table = response.data.place_name;
                $scope.table_data = response.data.data;
            }, function errorCallback(response) {
                console.log("response", response);
                $rootScope.load = false;
                console.log('table request error');
            });
        }

        $scope.theadClick = function (key) {
            $scope.sortType = key;
            $scope.sortReverse = !$scope.sortReverse;

            var k = 1 * ($scope.sortReverse ? 1 : -1);

            $scope.table_data.sort(function(a, b) {
                if (a[key] > b[key]) {
                    return k;
                }
                if (a[key] < b[key]) {
                    return -k;
                }
                return 0;
            });
        };
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