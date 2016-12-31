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
            updateFunc,
            shiftFunc
        );
    });

    mts.displayGraphs();
})();
