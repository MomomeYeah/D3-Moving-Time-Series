(function() {
    var updateInterval = 500;
    var size = 21;
    var random = d3.randomUniform(0, 100);
    var data = d3.range(size).map(random);

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
        .domain([0, size - 1])
        .range([0, width]);

    var xAxis = d3.axisBottom(x)
        .tickFormat(function(d) {
            return size - d - 1;
        });

    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    var line = d3.line()
        .x(function(d,i) {
            // given data point d and index i, return the result of X(i)
            // console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
            return x(i);
        })
        .y(function(d) {
            // given data point d, return the result of Y(d)
            // console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
            return y(d);
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

    graph.append("defs")
        .append("clipPath")
            .attr("id", "clip")
            .append("rect")
                .attr("width", width)
                .attr("height", height);

    graph.append("g")
        .attr("clip-path", "url(#clip)")
        .append("svg:path")
        .attr("class", "line")
        .datum(data)
        .transition()
            .duration(updateInterval)
            .ease(d3.easeLinear)
            .on("start", update);

    function update() {
        data.push(Math.random() * 100);

        // redraw
        graph.select(".line")
            .attr("d", line)
            .attr("transform", null);

        // slide
        d3.active(this)
            .attr("transform", "translate(" + x(-1) + ",0)")
            .transition()
                .on("start", update);

        data.shift();
    };

})();
