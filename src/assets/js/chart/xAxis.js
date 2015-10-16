(function(d3, fc, sc) {
    'use strict';

    sc.chart.xAxis = function() {

        var xAxisHeight = 20;
        var xScale = fc.scale.dateTime();
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        var dataJoin = fc.util.dataJoin()
            .selector('g.x-axis')
            .element('g')
            .attr('class', 'x-axis');

        function preventTicksMoreFrequentThanPeriod(period) {
            var scaleTickSeconds = (xScale.ticks()[1] - xScale.ticks()[0]) / 1000;
            if (scaleTickSeconds < period.seconds) {
                xAxis.ticks(period.d3TimeInterval.unit, period.d3TimeInterval.value);
            } else {
                xAxis.ticks(6);
            }
        }

        function xAxisChart(selection) {
            var xAxisContainer = dataJoin(selection, [selection.datum()])
                .layout({
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    right: 0,
                    height: xAxisHeight
                });

            selection.layout();

            xScale.range([0, xAxisContainer.layout('width')])
                .domain(selection.datum().viewDomain);

            preventTicksMoreFrequentThanPeriod(sc.model.selectedPeriod);

            xAxisContainer.call(xAxis);
        }

        return xAxisChart;
    };
})(d3, fc, sc);