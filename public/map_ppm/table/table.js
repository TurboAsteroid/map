'use strict';
angular.module('tableModule', ['ngRoute'])
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService, $rootScope) {
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
            // N_KART: "Номер склада",
            PLOSH: "Cклад",
            LGORT: "Место хранения",
            PR_NUMBER_ACT:"Акт",
            MATNR_CPH_PPM: "ПРОДУКТ НЕМАГН",
            MENGE: "Остаток",
            MEINS: "Ед. изм.",
            NAME_ZPOST: "Поставщик",
            PR_ZDAT_PROB:"дата апробирования",
            PR_NOTE: "Заметки",
            date:"Дата выгрузки"
        };
        $scope.$watch(function(){
            return $rootScope.table + $rootScope.date;
        }, function(table) {
            if($routeParams.place || $routeParams.raw) {
                load_place($routeParams.svg_zone, $routeParams.place, $routeParams.raw, $routeParams.date );
            }
        });

        function load_place (zone, place, raw, date) {
            $rootScope.load = true;
            $scope.sortType     = false;
            $scope.sortReverse  = false;
            $http({
                method: 'POST',
                url: '/api/get_table/',
                data: {zone: zone, place: place, raw: raw, date: date}
            }).then(function successCallback(response) {

                if (response.data.success) {
                    $rootScope.load = false;
                    $rootScope.table = raw || place;
                    $rootScope.date = date;
                    $scope.table_data = response.data.data;

                    if (response.data.timeline.length) {

                        $("#splineTimeline").highcharts({
                            chart: {
                                zoomType: 'x'
                            },
                            title: {
                                text: 'Общее количество «' + $rootScope.raw + '» на складе'
                            },
                            xAxis: {
                                type: 'datetime'
                            },
                            yAxis: {
                                title: {
                                    text: 'Количество сырья'
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            plotOptions: {
                                area: {
                                    fillColor: {
                                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                                        stops: [
                                            [0, Highcharts.getOptions().colors[0]],
                                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                        ]
                                    },
                                    marker: {
                                        radius: 2
                                    },
                                    lineWidth: 1,
                                    states: {
                                        hover: {
                                            lineWidth: 1
                                        }
                                    },
                                    threshold: null
                                }
                            },

                            series: [{
                                type: 'area',
                                name: $rootScope.raw,
                                data: response.data.timeline,
                                events: {
                                    click: function (event) {
                                        $location.search({
                                            'svg_zone': $routeParams.svg_zone,
                                            'place': null,
                                            'raw': $routeParams.raw,
                                            'date': event.point.x
                                        });
                                        $scope.$apply();
                                    }
                                }
                            }]
                        });
                    } else {
                        $("#splineTimeline").html("");
                    }
                }
            }, function errorCallback(response) {
                if (!response.data.success) {
                    $rootScope.load = false;
                    console.log('table request error');
                }
                $location.path('/');
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