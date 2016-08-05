'use strict';
angular.module('directivesModule', [])
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
                            tooltip_title.text(storage_list.storages[$(this).data('zonaid')].name + ' - ' + storage_list.areas[storage_list.storages[$(this).data('zonaid')].area]);
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
                                    for (var j in tmp) {
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
                        .on("mousemove", function(){
                            tooltip.css({
                                "top": (event.pageY - 10) + "px",
                                "left": (event.pageX + 10) + "px"
                            });
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
                Zoom.get('zoom_obj').scaleExtent([0.7, 6]);
                // Zoom.get('zoom_obj').translateExtent([[0, 0], [3000, 4000]]);
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