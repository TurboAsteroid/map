'use strict';
angular.module('search_by_actModule', ['ngRoute'])
    .controller('search_by_actController', function($scope, $http, $location, User, $routeParams, $mdDialog, localStorageService, TableData, $rootScope) {
        $scope.sortType     = false;
        $scope.sortReverse  = false;
        $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('html,body').animate({
                scrollTop: $("#datatable_anchor2").offset().top
            }, 500);
            calculate_thead();
        });

        function calculate_thead() {
            var old_thead = $('#place_datatable2 thead:not(.duplicate_thead)');
            var new_thead = $('#place_datatable2 thead.duplicate_thead');
            old_thead.find('th').each(function () {
                var ind = old_thead.find('th').index(this);
                new_thead.find('th').filter(':eq('+ind+')').add($(this)).css({width: $(this).width()})
            });
        }
        $('#place_datatable2').scroll(function () {
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
            CU_END: "Cu",
            AU_END: "Au",
            AG_END: "Ag",
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
            // ZDATV: "Дата отчета",
            // TIMEV: "Время отчета",
            // timestamp: "Дата отчета"
        };

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

        $scope.$watch(function(){
            return $rootScope.act;
        }, function(act) {
            if(act != undefined || act != null)
                act = act.toString();
            else
                act = "";
            if(act != "" && act != undefined && act != null && (act.length > 2) && act == $scope.act) {
                $scope.table_data = TableData.get();
                $scope.table_name = "Результаты поиска";
            }
            else {
                $scope.table_name = undefined;
            }
        });
    });