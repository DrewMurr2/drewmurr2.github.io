var rig = 'Savanna_801_4_ii'
var reloadEverythingTimer
var overView
var chart
$(window).ready(function () {
    load_Everything(load_Everything_callback)
    viewHeight = window.innerHeight
});
/*
$('#ValuesLogsToggle').change(function () {
    if ($(this).prop('checked') === true) {
        $('#homepage').addClass('incognito')
        $('#logpage').addClass('incognito')
        $('#valuespage').removeClass('incognito')
    }
    else {
        $('#homepage').addClass('incognito')
        $('#valuespage').addClass('incognito')
        $('#logpage').removeClass('incognito')
        loadLogsPageMenu()
    }
})*/
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

function changeSpeed(sp) {
    $(speed).html(sp + 'x')
}

function openLogsLive() {
    $('#homepage').addClass('incognito')
    $('#valuespage').addClass('incognito')
    $('#logpage').removeClass('incognito')
    $('#time_span_bar2').addClass('incognito')
    $('#historicLogOptions').addClass('incognito')
}

function openLogsHistoric() {
    $('#homepage').addClass('incognito')
    $('#valuespage').addClass('incognito')
    $('#logpage').removeClass('incognito')
    $('#time_span_bar2').removeClass('incognito')
    $('#historicLogOptions').removeClass('incognito')
}

function openValuesLive() {
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
    reloadEverythingTimer = setInterval(load_Everything, 5000)
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