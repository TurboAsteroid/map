'use strict';
angular.module('tableModule', ['ngRoute'])
    .controller('tableController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService, $rootScope, TableData) {
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
            PR_NUMBER_ACT:"Акт",
            ZDATIN:"Дата поступления",
            MATNR_CPH_PPM: "Название Сырья",
            MATNR_OS_PPM: "Отдел сырья",
            // PR_MATNR_CPH_PPM:" Код сырья",
            MENGE: "Остаток",
            MENGE_END_OH:"Остаток на ОХ",
            CU: "Cu",
            AU: "Au",
            AG: "Ag",
            MEINS: "Ед. изм.",
            PR_NOTE: "Заметки",
            PR_ZDAT_PROB:"Дата отбора проб",
            REASON_OH:"Причины ОХ",
            PR_DATA_OH_OUT:"Дата снятия с ОХ",
            NAME_ZPOST: "Поставщик",
            ZOTPR:"Отправитель",
            ZDATOUT:"Дата отправления",
            ZVIDTRANSP:"Вид транспорта",
            LGORT: "Место хранения",
            // date: "Дата отчета",
            // ZDATV: "Дата отчета"
            // timestamp: "Дата отчета"
        };

        $scope.$watch(function(){
            return $rootScope.table + $rootScope.date;
        }, function(table) {
            if($routeParams.place || $routeParams.raw) {
                load_place($routeParams.svg_zone, $routeParams.place, $routeParams.raw, $routeParams.date );
            }
        });

        $scope.$watch(function(){
            return $rootScope.act;
        }, function(act) {
            if(act != "" && act != undefined && act != null && ($scope.act.length > 2)) {
                $scope.table_data = TableData.get();
                $rootScope.table = "Результаты поиска";
            }
            else {
                $rootScope.act = $scope.act;
                $rootScope.table = undefined;
            }
        });

        function load_place (zone, place, raw, date) {
            $scope.search_text = "";
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
                    $scope.table_data_O = response.data.data;
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
                                data: response.data.timeline
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

        // DISABLED
        // $scope.search_text = "";
        // $scope.search = function () {
        //     $scope.search_text = $scope.search_text.toLowerCase();
        //     $scope.table_data_S = [];
        //     var obj, i = 0;
        //     for(obj in $scope.table_data_O) {
        //         var item;
        //         for(item in $scope.table_data_O[obj]) {
        //             if((($scope.table_data_O[obj][item]).toLowerCase()).indexOf($scope.search_text) != -1) {
        //                 $scope.table_data_S[i] = $scope.table_data_O[obj];
        //                 i++;
        //                 break;
        //             }
        //         }
        //     }
        //     $scope.table_data = $scope.table_data_S;
        // };

        $scope.theadClick = function (key) {
            $scope.sortType = key;
            $scope.sortReverse = !$scope.sortReverse;

            var k = 1 * ($scope.sortReverse ? 1 : -1);

            $scope.table_data.sort(function(a, b) {
                var val1 = a[key];
                var val2 = b[key];
                if (["LGORT","PR_NUMBER_ACT","MENGE","MENGE_END_OH"].indexOf(key) != -1 ) {
                    val1 = parseFloat(val1);
                    val2 = parseFloat(val2);
                } else if (["PR_DATA_OH_OUT","ZDATOUT","ZDATIN","PR_ZDAT_PROB"].indexOf(key) != -1 ) {
                    var tmp = val1.split(" ")[0].split(".");
                    tmp = new Date(tmp[2], tmp[1] - 1, tmp[0]);
                    val1 = new Date(tmp);

                    tmp = val2.split(" ")[0].split(".");
                    tmp = new Date(tmp[2], tmp[1] - 1, tmp[0]);
                    val2 = new Date(tmp);
                }

                if (val1 > val2) {
                    return k;
                }
                if (val1 < val2) {
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