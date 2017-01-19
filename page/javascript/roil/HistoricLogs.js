var playSpeed = 1
var startTime
var endtime
var historicPlayTImer
var historicCallTimer
var lastUpdatedTime
var arrayOfWindowObjects = [];

function changeSpeed(sp) {
    $(speed).html(sp + 'x')
    playSpeed = (sp * 1)
}
$('#goTimespan').click(goTimespanSelect);
$('#cancelTimespan').click(function () {
    chart.options.data[overView.Tracks.length].dataPoints = []
    chart.render()
});

function goTimespanSelect() {
    chart.options.data[overView.Tracks.length].dataPoints = []
    arrayOfWindowObjects = []
    chart.render()
    retrieveCurrentWindowObject(startTime, endtime, function (CW) {
        overView.CurrentWindow = CW
        changeLogObject(overView.CurrentWindow)
    })
};

function retrieveCurrentWindowObject(startt, endt, successCallback) {
    var startTimeUrl = yCoordinateToDateTimeURL(startt)
    var endTimeUrl = yCoordinateToDateTimeURL(endt)
    options = {
        url: "https://roilapi.azurewebsites.net/api/betweenTime?Rigname=Savanna_801_4_ii&NumberOfRows=500&StartTime=" + startTimeUrl + "&EndTime=" + endTimeUrl
        , type: "GET"
    , }
    $.ajax(options).success(function (response) {
        var tempO = JSON.parse(response);
        convertDates(tempO);
        generate_coordinates(tempO);
        successCallback(tempO)
    });
}

function dateTimeToUrlString(dateT) {
    var DateString = ""
    DateString += dateT.getFullYear()
    DateString += "-"
    DateString += (dateT.getMonth() + 1)
    DateString += "-"
    DateString += (dateT.getDate())
    DateString += "-"
    DateString += dateT.getHours()
    DateString += "-"
    DateString += dateT.getMinutes()
    DateString += "-"
    DateString += dateT.getSeconds()
    return DateString
}

function yCoordinateToDate(y) {
    return new Date(parseInt(y) * -1)
}

function yCoordinateToDateTimeURL(y) {
    return dateTimeToUrlString(yCoordinateToDate(y))
}
$('#playToggle').change(function () {
    if ($('#playToggle').prop('checked') === true) {
        /*pause*/
        clearInterval(historicPlayTImer)
        clearInterval(historicCallTimer)
    }
    else {
        /*play*/
        lastUpdatedTime = Date.now()
        historicPlayTImer = setInterval(playHistoricTimerTick, 100)
        historicCallTimer = setInterval(callHistoricTimerTick, 5000)
    }
})
var updateCounter = 0
var missedCounter = 0

function missedPercent() {
    return (missedCounter / (missedCounter + updateCounter)) * 100
}

function playHistoricTimerTick() {
    dropUneccessaryArrayObject();
    var updatedBool = false
    var timechange = (Date.now() - lastUpdatedTime) * playSpeed
    var desiredEndTime = LastTimeInWindow() - timechange
    for (var ii = 0; ii < arrayOfWindowObjects.length; ii++) {
        if (arrayOfWindowObjects[ii].RealStartTime < desiredEndTime) {
            continue;
        }
        for (var i2 = 0; i2 < arrayOfWindowObjects[ii].RealDates.length; i2++) {
            if (arrayOfWindowObjects[ii].RealDates[i2] < desiredEndTime) {
                break;
            }
            if (arrayOfWindowObjects[ii].RealDates[i2] < LastTimeInWindow()) {
                updatedBool = true
                overView.CurrentWindow.RealDates.shift()
                overView.CurrentWindow.RealDates.push(arrayOfWindowObjects[ii].RealDates[i2])
                overView.CurrentWindow.RealStartTime = overView.CurrentWindow.RealDates[0]
                overView.CurrentWindow.RealEndTime = overView.CurrentWindow.RealDates[overView.CurrentWindow.RealDates.length - 1]
                for (var i3 = 0; i3 < overView.CurrentWindow.Tracks.length; i3++) {
                    overView.CurrentWindow.Tracks[i3].coordinates.shift()
                    overView.CurrentWindow.Tracks[i3].coordinates.push(arrayOfWindowObjects[ii].Tracks[i3].coordinates[i2])
                }
            }
        }
    }
    if (updatedBool === true) {
        lastUpdatedTime = Date.now()
        changeLogObject(overView.CurrentWindow)
        updateCounter += 1
    }
    else {
        missedCounter += 1
    }
};

function dropUneccessaryArrayObject() {
    for (var i = arrayOfWindowObjects.length - 1; i >= 0; i--) {
        if (arrayOfWindowObjects[i].RealEndTime > LastTimeInWindow()) {
            arrayOfWindowObjects.splice(i, 1);
        }
    }
}

function callHistoricTimerTick() {
    dropUneccessaryArrayObject()
    if (arrayOfWindowObjects.length < 10) {
        var startt = LastTimeInArray()
        var endt = startt + CurrentWindowSpan()
        retrieveCurrentWindowObject(startt, endt, function (CW) {
            arrayOfWindowObjects.push(CW)
        });
    };
};

function startTimeinWindow() {
    return overView.CurrentWindow.RealStartTime
};

function LastTimeInWindow() {
    return overView.CurrentWindow.RealEndTime
};

function CurrentWindowSpan() {
    return (LastTimeInWindow() - startTimeinWindow())
};

function LastTimeInArray() {
    var lastTime = LastTimeInWindow();
    for (var i = arrayOfWindowObjects.length - 1; i >= 0; i--) {
        if (arrayOfWindowObjects[i].RealEndTime < lastTime) {
            lastTime = arrayOfWindowObjects[i].RealEndTime
        }
    }
    return lastTime
}