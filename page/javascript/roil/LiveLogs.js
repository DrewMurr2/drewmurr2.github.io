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
    for (i = 0; i < overView.Tracks.length; i++) {
        if (overView.Tracks[i].status === 1) {
            chart.options.data[i].dataPoints = obj.Tracks[i].coordinates
        }
    }
    chart.options.axisY.minimum = obj.RealEndTime
    chart.options.axisY.maximum = obj.RealStartTime
    if (obj.newinterval === true) {
        chart.options.axisY.interval = chooseInterval(obj);
        obj.newinterval = false
    }
    chart.render()
}

function chooseInterval(obj) {
    if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (30 * 60 * 1000)) {
        return (5 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (60 * 60 * 1000)) {
        return (10 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (90 * 60 * 1000)) {
        return (15 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (3 * 60 * 60 * 1000)) {
        return (30 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (6 * 60 * 60 * 1000)) {
        return (1 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (12 * 60 * 60 * 1000)) {
        return (2 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (1 * 24 * 60 * 60 * 1000)) {
        return (4 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (2 * 24 * 60 * 60 * 1000)) {
        return (8 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (3 * 24 * 60 * 60 * 1000)) {
        return (12 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (6 * 24 * 60 * 60 * 1000)) {
        return (1 * 24 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (12 * 24 * 60 * 60 * 1000)) {
        return (2 * 24 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (24 * 24 * 60 * 60 * 1000)) {
        return (4 * 24 * 60 * 60 * 1000)
    }
    else if (((obj.RealEndTime * -1) - (obj.RealStartTime * -1)) < (48 * 24 * 60 * 60 * 1000)) {
        return (16 * 24 * 60 * 60 * 1000)
    }
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