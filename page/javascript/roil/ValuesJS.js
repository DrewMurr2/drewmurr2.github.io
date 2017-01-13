var loadValuesTimer = null;
var loadLatestTimer
var reloadOverviewTimer
var viewHeight
var overView
var numberOfrows = 500
var previouslyDisplayedTime
var ValuesPageStatus


function load_valuesPage() {
    populateValuesPageHTMLelements()
    load_time_span_bar();
};

function change_values() {
    for (i = 0; i < overView.Latest.DateTime.Dates.length; i += 1) {
        if (valuesParseJsonDate(overView.Latest.DateTime.Dates[i]) > previouslyDisplayedTime) {
            updateValues(i, overView.Latest)
            return undefined;
        }
    }
}

function nutting() { /* console.log('nutting')*/
    load_latest_(function () {}, 30)
}

function reloadOverview() {
    load_Overview(function () {
        console.log('reloadOverview CALLBACK')
    });
    console.log('reloadOverview')
}
//http://localhost:49614/api/latestVals?table=Savanna_801_4_ii&offset=15
function load_latest_(success_callback, number) {
    /*  console.log('load_latest_')*/
    var options = {
        url: "https://roilapi.azurewebsites.net/api/latestVals?table=" + rig + "&offset=" + number
        , type: "GET"
    , };
    $.ajax(options).success(function (response) {
        if (response) {
            overView.Latest = JSON.parse(response);
            success_callback(overView.Latest)
        }
        else {
            console.log(response)
        }
    });
}

function populateValuesPageHTMLelements() {
    var RowOptions = {
        color: [['darkgrey', 'lightgray']
           , ['darkkhaki', 'lightgoldenrodyellow']]
        , index: 0
    }

    function createRow(track) {
        return '<div class="row">\
            <div class="col-sm-6" style="background-color:' + RowOptions.color[RowOptions.index][0] + '; border:double">\
                <p style="font-size:x-large; padding:10px">' + track.Name + '</p>\
            </div>\
            <div class="col-sm-6" style="background-color:' + RowOptions.color[RowOptions.index][1] + '; border:double">\
                <p  id="' + track.Name + '"style="font-size:x-large; padding:10px">' + track.Values[0] + '</p>\
            </div>\
        </div>'
    }
    var htmll = ""
    overView.Tracks.forEach(function (track) {
        if (track.Name != 'ID') {
            htmll += createRow(track)
            RowOptions.index = (RowOptions.index + 1) % 2;
        }
    })
    $('#values_container').html(htmll)
    updateValues(overView.DateTime.Dates.length - 1, overView)
}

function valuesParseJsonDate(jsonDateString) {
    return new Date(parseInt(jsonDateString.replace('/Date(', '')));
}

function chopDate(date) {
    var str = date + "" //conversion to string
    return str.slice(4, 24);
}

function updateValues(index, object) { // imports the values
    var thisTime = valuesParseJsonDate(object.DateTime.Dates[index])
    if (previouslyDisplayedTime === undefined || thisTime > previouslyDisplayedTime) {
        previouslyDisplayedTime = thisTime
    }
    $('#DateTime').html(chopDate(thisTime))
    object.Tracks.forEach(function (track) {
        $('#' + track.Name).html(track.Values[index] + '')
    })
}

function load_time_span_bar() { // This creates the Time Span slider bar
    var valheight = viewHeight * 0.7;
    $('#slider_column').height(valheight);
    $('#select_time_slider').height(valheight);
    var html5Slider = $('#select_time_slider')[0];
    noUiSlider.create(html5Slider, {
        start: [overView.Tracks[0].Values.length - 1]
        , orientation: "vertical"
        , step: 1
        , range: {
            'min': 0
            , 'max': (overView.Tracks[0].Values.length - 1)
        }
    , });
    html5Slider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider
        var handlePosition = values[0] * 1
        updateValues(handlePosition, overView)
    });
}