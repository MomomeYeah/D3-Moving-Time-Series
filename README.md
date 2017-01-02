# D3-Moving-Time-Series

Infinite gratitude to [Mike Bostock](https://bost.ocks.org/mike/), in particular [this demo](http://bl.ocks.org/mbostock/1642874) which I shamelessly copied.

To run/test/develop, first `sudo npm install -g http-server` and then `http-server &`.

## Examples

Check out a demo [here](https://momomeyeah.github.io/D3-Moving-Time-Series/)

## What's All This, Then?

Inspired by things like [NVD3](http://nvd3.org/), I wanted to have a nice, simple way to have a pretty graph showing a view of a data source from the last X seconds.  I wanted to be able to add data to this data source, and have the graph update nicely, and look like new data is streaming in on one side, and old data is streaming out the other side.

Unfortunately, while NVD3 and other libraries have lots of nice sample graphs, I couldn't find a way to do exactly what I wanted, either because it's not possible or more likely because I'm not very clever.

So, I did it myself.

## How Do I Use This Thing?

It's pretty simple - check out some of the examples.  Basically you instantiate a `MovingTimeSeries` object, add some data sources to it, and tell it to draw.

Let's go through some key points of the `random_data` example.

First, make sure you include `moving_time_series.css`:

```
<link rel="stylesheet" href="../../moving_time_series.css" />
```

Second, create an empty div element with a class of `graph`:

```
<div class="graph"></div>
```

Make sure you include `moving_time_series.js` at the end of your page body:

```
<script src="../../moving_time_series.js"></script>
```

Finally, write a short little javascript snippet that instantiates a `MovingTimeSeries` object, adds data items that each have a function to add a new value to an array and remove an old value, and tells D3 to draw everything:

```
// given an array, add a new random value to it
function updateFunc(arr) {
    arr.push(Math.random() * 100);
}

function shiftFunc(arr) {
    arr.shift();
}

(function() {
    var mts = new MovingTimeSeries();

    [0, 1, 2, 3].forEach((item) => {
        mts.addDataSource(
            "Item " + item,
            updateFunc,
            shiftFunc
        );
    });

    mts.displayGraphs();
})();
```

## Phew That Was Painless - What Can This Thing Do?

Well it displays a graph which shows the last 20 entries from as many data sources as you like.  It assumes that the range of data goes from 0-100.  Every second, the user-defined update/shift functions are called in order to update each data source, and the graph will smoothly shift data along.

There's also a legend, where you can click the descriptive text to toggle display of a line on/off.

There's only 7 possible colours, so these are cycled through if there are more data sources than that.

## How Do I Contribute?

The normal way!  To make the GitHub Pages demo page work, I'm currently using a pre-commit hook to copy the project assets into the demo folder.

Create a file called `.git/hooks/pre-commit` (note no file extension), make sure it's executable, and give it the following contents:

```
#!/bin/bash

SCRIPTPATH=$( cd $(dirname $0) ; pwd -P )
PROJECTPATH=$(dirname $(dirname $SCRIPTPATH))

find "$PROJECTPATH/docs/moving_time_series" -type f | xargs rm
cp "$PROJECTPATH/moving_time_series.css" "$PROJECTPATH/docs/moving_time_series"
cp "$PROJECTPATH/moving_time_series.js" "$PROJECTPATH/docs/moving_time_series"

git add "$PROJECTPATH/docs/moving_time_series/*"
```
