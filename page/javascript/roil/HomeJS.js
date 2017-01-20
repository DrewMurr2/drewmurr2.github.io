var rig = 'Savanna_801_4_ii'
var reloadlatestTimer
var overView
var chart
$(window).ready(function () {
    load_Everything(load_Everything_callback)
    viewHeight = window.innerHeight
});
$('#ValuesLogsToggle').change(evaluateBothToggles)
$('#LiveHistoricToggle').change(evaluateBothToggles)

function evaluateBothToggles() {
    /*Values - Historic*/
    if ($('#ValuesLogsToggle').prop('checked') === true && $('#LiveHistoricToggle').prop('checked') === true) {
        openValuesHistoric()
    }
    /*'Values - Live'*/
    if ($('#ValuesLogsToggle').prop('checked') === true && $('#LiveHistoricToggle').prop('checked') === false) {
        openValuesLive()
    }
    /*'Logs - HIstoric'*/
    if ($('#ValuesLogsToggle').prop('checked') === false && $('#LiveHistoricToggle').prop('checked') === true) {
        openLogsHistoric()
    }
    /*'Logs - Live'*/
    if ($('#ValuesLogsToggle').prop('checked') === false && $('#LiveHistoricToggle').prop('checked') === false) {
        openLogsLive()
    }
}

function openLogsLive() {
    $('#homepage').addClass('incognito')
    $('#valuespage').addClass('incognito')
    $('#logpage').removeClass('incognito')
    $('#time_span_bar2').addClass('incognito')
    $('#historicLogOptions').addClass('incognito')
}

function openLogsHistoric() {
    clearInterval(reloadlatestTimer)
    $('#homepage').addClass('incognito')
    $('#valuespage').addClass('incognito')
    $('#logpage').removeClass('incognito')
    $('#time_span_bar2').removeClass('incognito')
    $('#historicLogOptions').removeClass('incognito')
}

function openValuesLive() {
    clearInterval(reloadlatestTimer)
    loadLatestValues()
    reloadlatestTimer = setInterval(loadLatestValues, 5000)
    $('#homepage').addClass('incognito')
    $('#logpage').addClass('incognito')
    $('#valuespage').removeClass('incognito')
    loadValuesTimer = setInterval(change_values, 1000);
    $('#slider_column').addClass('incognito')
}

function openValuesHistoric() {
    $('#homepage').addClass('incognito')
    $('#logpage').addClass('incognito')
    $('#valuespage').removeClass('incognito')
    if (loadValuesTimer) {
        clearInterval(loadValuesTimer)
    }
    $('#slider_column').removeClass('incognito')
}
$('#homepagebutton').click(function () {
    $('#valuespage').addClass('incognito')
    $('#logpage').addClass('incognito')
    $('#homepage').removeClass('incognito')
})

function load_Everything(success_callback) {
    var options
    if (overView === undefined || overView.CurrentWindow === undefined || overView.CurrentWindow.SetStart === undefined) {
        options = {
            /*  url: "http://localhost:49614/api/Everything?Rig=" + rig*/
            url: "https://roilapi.azurewebsites.net/api/Everything?Rig=" + rig
            , type: "GET"
        , }
    }
    else {
        if (overView.CurrentWindow.SetEnd === undefined) {
            options = {
                url: "https://roilapi.azurewebsites.net/api/Everything?Rig=" + rig + "&Start=" + overView.CurrentWindow.SetStart
                , type: "GET"
            , }
        }
        else {
            options = {
                url: "https://roilapi.azurewebsites.net/api/Everything?Rig=" + rig + "&Start=" + overView.CurrentWindow.SetStart + "&End=" + overView.CurrentWindow.SetEnd
                , type: "GET"
            , }
        }
    }
    $.ajax(options).success(function (response) {
        var tempO = JSON.parse(response);
        ConvertingDatesANDGeneratingCoordinates(tempO)
        overView = tempO
        overView.newinterval = true
        if (liveBool === true && chart !== undefined) {
            changeLogObject(overView.CurrentWindow)
        }
        if (success_callback !== undefined) {
            success_callback(overView)
        }
    });
}

function load_Everything_callback(Overview) {
    load_valuesPage()
    load_logsPage()
}

function loadLatestValues() {
    options = {
        url: "https://roilapi.azurewebsites.net/api/latestVals?table=" + rig + "&offset=15"
        , type: "GET"
    , }
    $.ajax(options).success(function (response) {
        var tempO = JSON.parse(response);
        convertDates(tempO);
        generate_coordinates(tempO);
        overView.Latest = tempO
    });
}

function ConvertingDatesANDGeneratingCoordinates(tempO) {
    convertDates(tempO);
    generate_coordinates(tempO);
    convertDates(tempO.Latest)
    generate_coordinates(tempO.Latest)
    convertDates(tempO.CurrentWindow)
    generate_coordinates(tempO.CurrentWindow)
}

function convertDates(obj) {
    var realDates = []
    var i = 0
    obj.DateTime.Dates.forEach(function (JSONdate) {
        realDates[i] = parseJsonDate(JSONdate)
        i++
    })
    obj.RealDates = realDates
    obj.RealStartTime = parseJsonDate(obj.starttime)
    obj.RealEndTime = parseJsonDate(obj.endtime)
}

function parseJsonDate(jsonDateString) {
    return parseInt(jsonDateString.replace('/Date(', '')) * -1;
}