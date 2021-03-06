function MovingTimeSeries() {
    this.allowResize = true;
    this.data = [];

    this.displaySize = 20;
    this.dataSize = this.displaySize + 3;

    // thanks to http://www.mulinblog.com/a-color-palette-optimized-for-data-visualization/
    this.colors = [
        "#5DA5DA",
        "#FAA43A",
        "#60BD68",
        "#F17CB0",
        "#B2912F",
        "#B276B2",
        "#DECF3F"
    ];

    this.addDataSource = (legendLabel, updateFunc, shiftFunc) => {
        var index = this.data.length;
        var dArray = d3.range(this.dataSize).map(() => 0);
        this.data.push({
            dataArray: dArray,
            color: this.colors[index % this.colors.length],
            pathClass: "line" + index,
            legendClass: "legend" + index,
            legendLabel: legendLabel,
            line: null,
            updateFunc: () => {
                updateFunc(dArray);
            },
            shiftFunc: () => {
                shiftFunc(dArray);
            }
        });
    }

    this.displayGraphs = () => {
        // save value of `this` for use within D3 functions
        var self = this;

        // how often updateFunc() should be called for each data stream, and
        // a graph line correspondingly shifted.  x-axis marks are in seconds,
        // so updating at a frequency of anything other than once per second
        // wouldn't make much sense
        var updateInterval = 1000;

        var widthBase = 720;
        var heightBase = 480;

        var legendWidth = widthBase;
        var legendHeight = 40;

        var margins = {
            "top": 20,
            "right": 20,
            "bottom": 50,
            "left": 70
        };
        var width = widthBase - margins.left - margins.right;
        var height = heightBase - margins.top - margins.bottom - legendHeight;

        var x = d3.scaleLinear()
            .domain([0, self.displaySize])
            .range([0, width]);

        var xAxis = d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat(function(d) {
                return self.displaySize - d;
            });

        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        var yAxis = d3.axisLeft(y)
            .tickSize(-width);

        // clear contents of graph node in case we're redrawing
        d3.select(".graph").selectAll("*").remove();

        // add top-level SVG element, along with legend and graph groups
        d3.select(".graph")
            .append("svg:svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + widthBase + " " + heightBase)
            .append("svg:g")
                .attr("id", "legendGroup")
                .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
            .append("svg:g")
                .attr("id", "graphGroup")
                .attr("transform", "translate(0," + legendHeight + ")")

        var legend = d3.select("#legendGroup");
        var graph = d3.select("#graphGroup");

        // add x axis and move it to bottom of graph
        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // text label for the x axis
        graph.append("text")
            .attr("class", "axis-label")
            .attr("y", height + (margins.bottom / 2))
            .attr("x", width / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Seconds Since");

        // add y axis
        graph.append("svg:g")
            .attr("class", "y axis")
            .call(yAxis);

        // text label for the y axis
        graph.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (2 * margins.left / 3))
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percent");

        // define clip path
        graph.append("defs")
            .append("clipPath")
                .attr("id", "clip")
                .append("rect")
                    .attr("width", width)
                    .attr("height", height);

        // add legend containing group
        legend.append("g")
            .attr("id", "legend")
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", legendWidth)
                .attr("height", legendHeight);

        function createLine(dataItem) {
            dataItem.line = d3.line()
                .x(function(d,i) {
                    // given data point d and index i, return the result of X(i)
                    // console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                    return x(i - 1);
                })
                .y(function(d) {
                    // given data point d, return the result of Y(d)
                    // console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                    return y(d);
                })
                .curve(d3.curveBasis);
        }

        function addLineForDataSource(dataItem) {
            graph.append("g")
                    .attr("clip-path", "url(#clip)")
                .append("svg:path")
                    .attr("class", dataItem.pathClass)
                    .attr("style", "stroke: " + dataItem.color)
                    .datum(dataItem.dataArray)
                    .transition()
                        .duration(updateInterval)
                        .ease(d3.easeLinear)
                        .on("start", function() {
                            var context = this;
                            update(context, dataItem);
                        });
        }

        var offset = 0;
        var radius = height / 40;
        var legendItemYOffset = height / 40;
        var legendTextYOffset = height / 30;
        function addLegendItemForDataSource(dataItem) {
            var textEl = d3.select("#legend")
                            .append("text")
                                .attr("x", width - offset)
                                .attr("y", legendTextYOffset)
                                .attr("text-anchor", "end")
                                .attr("class", "legend-text")
                                .text(dataItem.legendLabel)
                                .on("click", function() {
                                    // if this.lineVisibile === undefined, we haven't
                                    // toggled it yet, so it must be visible
                                    var lineVisibile = this.lineVisibile;
                                    if (lineVisibile === undefined || !lineVisibile) {
                                        this.lineVisibile = true;
                                    } else {
                                        this.lineVisibile = false;
                                    }

                                    // if line is now visible, opacity = 0, else 1
                                    var opacity = this.lineVisibile ? 0 : 1;
                                    d3.select("." + dataItem.pathClass)
                                        .attr("opacity", opacity);
                                });

            offset += textEl.node().getComputedTextLength() + (radius * 1.5);

            d3.select("#legend")
                .append("circle")
                    .attr("r", radius)
                    .attr("cx", width - offset)
                    .attr("cy", legendItemYOffset)
                    .attr("class", "legend-item " + dataItem.legendClass)
                    .attr("style", "fill: " + dataItem.color);

            offset += radius * 1.5;
        }

        this.data.forEach((item) => {
            createLine(item);
            addLineForDataSource(item);
            addLegendItemForDataSource(item);
        })

        function update(context, dataItem) {
            // add new data point
            dataItem.updateFunc();

            // redraw
            graph.select("." + dataItem.pathClass)
                .attr("d", dataItem.line)
                .attr("transform", null);

            // slide
            d3.active(context)
                .attr("transform", "translate(" + x(-1) + ",0)")
                .transition()
                    .on("start", function() {
                        update(context, dataItem)
                    });

            // remove oldest pata point
            dataItem.shiftFunc();
        };
    }

    window.addEventListener("resize", function() {
        if (this.allowResize) {
            // redraw graph
            this.displayGraphs();

            // disable redraw for 100ms
            this.allowResize = false;
            window.setTimeout(() => {
                this.allowResize = true;
            }, 100);
        }
    });
}
