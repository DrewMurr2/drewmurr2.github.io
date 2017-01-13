var liveBool = false

function liveClick() {
    if (liveBool === true) {
        liveBool = false
        $('#liveButton').html('Live')
    }
    else {
        liveBool = true
        $('#liveButton').html('Stop')
    }
}
var currentVisibleObject

function changeLogObject(obj) {
    currentVisibleObject = obj
    console.log('changeLogObject')
    for (i = 0; i < overView.Tracks.length; i++) {
        if (overView.Tracks[i].status === 1) {
            chart.options.data[i].dataPoints = obj.Tracks[i].coordinates
        }
    }
    chart.options.axisY.minimum = obj.RealStartTime
    chart.options.axisY.maximum = obj.RealEndTime
    chart.options.axisY.interval = (obj.RealEndTime - obj.RealStartTime) / 5
    chart.render()
}

function incrementLog(obj) {
    var LastTime = currentVisibleObject.RealDates[currentVisibleObject.RealDates.length - 1]
    var newObj
    for (i = 0; i < obj.RealDates.length; i++) {
        if (obj.RealDates[i] > LastTime) {
            for (a = 1; a < obj.RealDates.length; a++) {
                newObj.RealDates[a - 1] = obj.RealDates[a]
                for (trackNum = 0; trackNum < obj.Tracks.length; trackNum++) {
                    newObj.Tracks[trackNum].coordinates[a - 1] = obj.Tracks[trackNum].coordinates[a]
                }
            }
            newObj.RealDates[obj.RealDates.length - 1] = obj.RealDates[i]
            currentVisibleObject = newObj
        }
    }
}

function liveTimerTick() {
    changeLogObject(overView.CurrentWindow)
}