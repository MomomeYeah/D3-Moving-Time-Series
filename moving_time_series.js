(function() {
    var updateInterval = 500;

    var displaySize = 20;
    var dataSize = displaySize + 3;

    var widthBase = 720;
    var heightBase = 480;
    var margins = {
        "top": 20,
        "right": 20,
        "bottom": 50,
        "left": 70
    };
    var width = widthBase - margins.left - margins.right;
    var height = heightBase - margins.top - margins.bottom;

    var x = d3.scaleLinear()
        .domain([0, displaySize])
        .range([0, width]);

    var xAxis = d3.axisBottom(x)
        .tickFormat(function(d) {
            return displaySize - d;
        });

    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    function updateFunc(arr) {
        arr.push(Math.random() * 100);
    }

    // thanks to http://www.mulinblog.com/a-color-palette-optimized-for-data-visualization/
    var colors = [
        "#5DA5DA",
        "#FAA43A",
        "#60BD68",
        "#F17CB0",
        "#B2912F",
        "#B276B2",
        "#DECF3F"
    ];

    function generateData() {
        var ret = []
        //var loopArr = [0];
        var loopArr = [0, 1, 2, 3];
        //var loopArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        loopArr.forEach((item) => {
            var dArray = d3.range(dataSize).map(() => 0);
            ret.push({
                dataArray: dArray,
                color: colors[item % colors.length],
                cssClass: "line" + item,
                line: null,
                updateFunc: () => {
                    updateFunc(dArray);
                },
                shiftFunc: () => {
                    dArray.shift();
                }
            });
        });
        return ret;
    }

    var data = generateData();

    function createLine() {
        return d3.line()
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

    data.forEach((item) => {
        item.line = createLine();
    });

    var graph = d3.select(".graph")
        .append("svg:svg")
            .attr("width", widthBase)
            .attr("height", heightBase)
        .append("svg:g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // text label for the y axis
    graph.append("text")
        .attr("class", "axis-label")
        .attr("y", height + (margins.bottom / 2))
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Seconds Since");

    graph.append("svg:g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

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

    function addLineForDataSource(dataItem) {
        graph.append("g")
                .attr("clip-path", "url(#clip)")
            .append("svg:path")
                .attr("class", dataItem.cssClass)
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

    data.forEach((item) => {
        addLineForDataSource(item);
    })

    function update(context, dataItem) {
        // add new data point
        dataItem.updateFunc();

        // redraw
        graph.select("." + dataItem.cssClass)
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

})();
