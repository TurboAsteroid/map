'use strict';
angular.module('directivesModule', [])
    .directive('ghVisualization', function ($location, $rootScope) {
        return {
            restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
            link: function (scope, element, attrs) {
                var parent = d3.select(element[0]);
                var polygon = parent.selectAll('polygon');
                polygon.each(function() {
                    this.id = "Склад " + (Math.floor((Math.random() * 100) + 1));
                });
                var tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("background", "#eee")
                    .style("box-shadow","0 0 5px #999999")
                    .style("padding", "10px")
                    .style("border", "1px solid #ccc")
                    .style("border-radius", "7px");
                polygon
                    .on("mouseover", function(){
                        tooltip.text(this.id);
                        return tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", function(){
                        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                    })
                    .on("mouseout", function(){
                        return tooltip.style("visibility", "hidden");
                    })
                    .on("click", function(){
                        tooltip.style("visibility", "hidden");
                        $rootScope.$broadcast("zone_click", {zone:d3.select(this).attr('id')});
                    });
                var svg_group = parent.select('g');
                parent.select("svg").call(d3.zoom().on("zoom", function() {
                    svg_group.attr("transform", d3.event.transform);
                }));
            }
        }
    });