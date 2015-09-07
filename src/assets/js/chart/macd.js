(function(d3, fc, sc) {
    'use strict';

    sc.chart.macd = function() {
        var yAxisWidth = 45;

        var dispatch = d3.dispatch('viewChange');

        var macdTimeSeries = fc.chart.linearTimeSeries()
            .xAxisHeight(0)
            .yAxisWidth(yAxisWidth)
            .yOrient('right');

        var zero = fc.annotation.line()
            .value(0)
            .label('');
        var macdRenderer = fc.indicator.renderer.macd();
        var multi = fc.series.multi()
            .series([zero, macdRenderer])
            .mapping(function(series) {
                if (series === zero) {
                    return [0];
                }
                return this.data;
            })
            .decorate(function(g) {
                g.enter()
                    .attr('class', function(d, i) {
                        return ['multi zero', 'multi'][i];
                    });
            });

        var macdAlgorithm = fc.indicator.algorithm.macd();

        function macd(selection) {
            var dataModel = selection.datum();

            macdAlgorithm(dataModel.data);

            macdTimeSeries.xDomain(dataModel.viewDomain);

            // Add percentage padding either side of extreme high/lows
            var maxYExtent = d3.max(dataModel.data, function(d) {
                return Math.abs(d.macd.macd);
            });
            var paddedYExtent = sc.util.domain.padYDomain([-maxYExtent, maxYExtent], 0.04);
            macdTimeSeries.yDomain(paddedYExtent);

            // Redraw
            macdTimeSeries.plotArea(multi);
            selection.call(macdTimeSeries);

            selection.selectAll('rect.foreground')
                .data([dataModel])
                .enter()
                .append('rect')
                .attr('class', 'foreground')
                .layout({
                    position: 'absolute',
                    top: 0,
                    right: yAxisWidth,
                    bottom: 0,
                    left: 0
                });

            selection.layout();

            // Behaves oddly if not reinitialized every render
            var zoom = d3.behavior.zoom();
            zoom.x(macdTimeSeries.xScale())
                .on('zoom', function() {
                    sc.util.zoomControl(zoom, selection.select('rect.foreground'), macdTimeSeries.xScale());
                    dispatch.viewChange(macdTimeSeries.xDomain());
                });

            selection.select('rect.foreground').call(zoom);
        }

        d3.rebind(macd, dispatch, 'on');

        return macd;
    };
})(d3, fc, sc);