'use strict';
angular.module('directivesModule', [])
    .directive('mapVisualization', function ($location, $http, $rootScope, MapData, $q) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {
                $q.all([
                    MapData.getData(),
                    $http({method: 'GET',url: '/api/get_storages'})
                ]).then(function(value) {
                    var mapData = value[0].data,
                        ppm = value[1].data.data,
                        new_data = [],
                        tmp_data = {},
                        i = 0,
                        j = 0;
                    for (var a_id in mapData.areas) {
                        new_data.push({
                            id: a_id,
                            name: mapData.areas[a_id].name,
                            color: mapData.areas[a_id].color
                        });
                    }
                    for (var s_id in mapData.storages) {
                        new_data.push({
                            id: mapData.storages[s_id].area+'|'+s_id,
                            name: mapData.storages[s_id].name,
                            parent: mapData.storages[s_id].area,
                            color: Highcharts.getOptions().colors[i%10]
                        });
                        i++;
                    }
                    for (s_id in ppm) {
                        for (var p_id in ppm[s_id]) {
                            new_data.push({
                                id: mapData.storages[s_id].area+'|'+s_id+'|'+p_id,
                                name: p_id,
                                parent: mapData.storages[s_id].area+'|'+s_id,
                                color: Highcharts.getOptions().colors[i%10]
                            });
                            i = 0;
                            for (var r_id in ppm[s_id][p_id]) {
                                new_data.push({
                                    id: mapData.storages[s_id].area+'|'+s_id+'|'+p_id+'|'+r_id,
                                    name: r_id,
                                    parent: mapData.storages[s_id].area+'|'+s_id+'|'+p_id,
                                    value: ppm[s_id][p_id][r_id],
                                    color: Highcharts.getOptions().colors[j%10],
                                    events: {
                                        click: function () {
                                            var tree = this.id.split('|');
                                            $location.search({'svg_zone': mapData.storages[tree[1]].name, 'place': null, 'raw': tree[3]});
                                            scope.$apply();
                                        }
                                    },
                                    cursor: "pointer"
                                });
                                j++;
                            }
                        }
                    }

                    var chart = $(element).highcharts({
                        series: [{
                            type: 'treemap',
                            layoutAlgorithm: 'squarified',
                            allowDrillToNode: true,
                            animationLimit: 1000,
                            dataLabels: {
                                enabled: false
                            },
                            levelIsConstant: false,
                            borderColor: "black",
                            borderWidth: 0,
                            levels: [{
                                level: 1,
                                dataLabels: {
                                    enabled: true
                                },
                                borderColor: "black",
                                borderWidth: 3
                            }],
                            data: new_data
                        }],
                        tooltip: {
                            followPointer: true,
                            pointFormatter: function() {
                                var value = this.value || this.node.childrenTotal;
                                return '<b>' + this.name + ':</b> '
                                    + Highcharts.numberFormat(value, 3, '.','')
                            },valueSuffix: 'E',
                            valueDecimals: 2
                        },
                        title: {
                            text: 'Склады'
                        }
                    });
                }, function(response) {
                    if (!response.data.success) {
                        $rootScope.load = false;
                        console.log('data request error');
                    }
                    $location.path('/');
                });
            }
        };
    })
    .directive('ghVisualization', function ($location, Zoom, $http, MapData) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {
                var parent = d3.select(element[0]);
                var objects = $('#map_objects > *');
                MapData.getData().then(function successCallback(response) {
                    var storage_list = response.data;
                    var tooltip = $("<div />", {class: "map_tooltip"});
                    var tooltip_title = $("<b />", {class: "map_tooltip_title"});
                    var tooltip_desc = $("<ul />", {class: "map_tooltip_desc"});
                    tooltip.append(tooltip_title, tooltip_desc);
                    $("body").append(tooltip);

                    objects
                        .on("mouseenter", function(){
                            $(this).siblings('*[data-zonaid="'+$(this).data('zonaid')+'"]').add($(this)).addClass('hovered');
                            tooltip_title.text(storage_list.storages[$(this).data('zonaid')].name + ' - ' + storage_list.areas[storage_list.storages[$(this).data('zonaid')].area].name);
                            tooltip_desc.html("");
                            for (var i in storage_list.storages[$(this).data('zonaid')].raws) {
                                var reg = /(\d+)(-(\d+))?(:(\d+))?/g;
                                var res = reg.exec(storage_list.storages[$(this).data('zonaid')].raws[i]);
                                var raw = storage_list.raws[res[1]];
                                var tmp_str = [];
                                if (res[3] !== undefined) {
                                    var tmp = res[3].split("");
                                    for (var j in tmp) {
                                        tmp_str.push(raw.name_note[tmp[j]]);
                                    }
                                }
                                var tmp_name = $("<span />", {class:"map_tooltip_desc_item_name", text: raw.name.replace("{name_note}", tmp_str.join(','))});

                                tmp_str = [];
                                if (res[5] !== undefined) {
                                    var tmp = res[5].split("");
                                    for ( j in tmp) {
                                        tmp_str.push(raw.note[tmp[j]]);
                                    }
                                } else if (typeof raw.note == "string") {
                                    tmp_str.push(raw.note);
                                }
                                var tmp_note = $("<span />", {class:"map_tooltip_desc_item_note", text: tmp_str.join(',')});
                                tooltip_desc.append($('<li />', {class: "map_tooltip_desc_item"}).append(tmp_name, tmp_note));
                            }
                            tooltip.show();
                        })
                        .on("mouseleave", function() {
                            $(this).siblings('*[data-zonaid="' + $(this).data('zonaid') + '"]').add($(this)).removeClass('hovered');
                            tooltip.hide();
                        })
                        .on("mousemove", function(event){

                            var tooltip_width = tooltip.width();
                            var block_left = $('#svg_map').offset().left;
                            var block_width = $('#svg_map').width();
                            var window_width = $(window).width();


                            if (window_width < event.pageX + tooltip_width) {
                                tooltip.css({
                                    "top": (event.pageY + 10) + "px",
                                    "left": (block_left + block_width - tooltip_width) + "px",
                                    "max-width": (window_width-20) + "px"
                                });
                            } else {
                                tooltip.css({
                                    "top": (event.pageY + 10) + "px",
                                    "left": (event.pageX + 10) + "px",
                                    "max-width": (window_width - 20) + "px"
                                });
                            }
                        })
                        .on("click", function(){
                            $location.search({'svg_zone': storage_list.storages[$(this).data('zonaid')].name, 'place': null, 'raw': null});
                            scope.$apply();
                        });
                }, function errorCallback(response) {
                    console.log('storage_list request error');
                });

                var svg_group = parent.select('g');
                Zoom.set({zoom_obj: d3.zoom()});
                var tmp_transform = {x: 0, y: 0, k: 1};
                Zoom.get('zoom_obj').scaleExtent([1, 6]);
                parent.select("svg").call(Zoom.get('zoom_obj').on("zoom", function() {
                    Zoom.set({transform: d3.event.transform});
                    svg_group.attr("transform", d3.event.transform);
                }));
            }
        }
    })
    .directive('onLastRepeat', function() {
        return function(scope, element, attrs) {
            if (scope.$last === true) {
                if (scope.$last) setTimeout(function(){
                    scope.$emit('onRepeatLast', element, attrs);
                }, 1);
            }
        };
    });