(function() {
    var data = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];

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

    // 10 data points, spread across the width
    var x = d3.scaleLinear()
        //.domain([0, data.length])
        .domain(d3.extent(data, function(d,i) { return i }))
        .range([0, width]);

    // 0 - 45, spread across the height
    var y = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([height, 0]);

    var line = d3.line()
        .x(function(d,i) {
            // given data point d and index i, return the result of X(i)
            console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
            return x(i);
        })
        .y(function(d) {
            // given data point d, return the result of Y(d)
            console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
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
        .call(d3.axisBottom(x));

    graph.append("svg:g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    graph.append("svg:path")
        .data([data])
        .attr("class", "line")
        .attr("d", line);

})();
