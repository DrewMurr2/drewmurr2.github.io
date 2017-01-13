var TracksDropDownHTML
var OptionsDropDownHTML = '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Options <span class="caret"></span></a><ul class="dropdown-menu"><li class="option" onclick="timeSpanClick()">Time Span<div class="status_indicator"></div></li><li class="option" onclick="viewOptionClick()">View<div class="status_indicator"></div></li></ul>'
var objectInView
var showDataLabels = false

function viewOptionClick() {
    $('#viewOptionsModal').modal('show');
}

function timeSpanClick() {
    $('#timeSpanModal').modal('show');
}

function generateTracksDropDownHTML() {
    TracksDropDownHTML = '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Tracks <span class="caret"></span></a>\                        <ul class="dropdown-menu">'
    var i = 0
    overView.Tracks.forEach(function (track) {
        TracksDropDownHTML += '<li class="track" onclick="HandleTrackClick(\'' + track.Name + '\', ' + (i) + ', this)">' + track.Name + '<div class="status_indicator"></div></li>'
        i++
    })
    TracksDropDownHTML += '</ul>'
}

function load_logsPage() {
    currentVisibleObject = overView
    generateTracksDropDownHTML()
    load_chart()
    adjust_chartjsHeight()
    loadLogsPageMenu()
}

function loadLogsPageMenu() {
    if (TracksDropDownHTML !== undefined) {
        $('#tracksdropdownmenu').html(TracksDropDownHTML)
    }
    if (OptionsDropDownHTML !== undefined) {
        $('#optionsdropdownmenu').html(OptionsDropDownHTML)
    }
}

function generate_coordinates(obj) {
    for (i = 0; i < obj.Tracks.length; i++) {
        if (overView === undefined) {
            obj.Tracks[i].colorposition = Math.random() + 0.27
            obj.Tracks[i].status = 0
        }
        else {
            obj.Tracks[i].colorposition = overView.Tracks[i].colorposition
            obj.Tracks[i].status = overView.Tracks[i].status
        }
        var coordinates = combine_x_y(obj.Tracks[i].Values, obj.RealDates);
        obj.Tracks[i].coordinates = coordinates
    }
}

function combine_x_y(arr_x, arr_y) { // created coordinates for tracks - called by load_tracks
    var array = [];
    $(arr_x).each(function (index) {
        var x = arr_x[index];
        var y = arr_y[index];
        array.push({
            x: x
            , y: y
        });
    });
    return array;
}

function load_chart() { // function to load chart  - called by documnet.ready
    var height = $(window).height();
    var width = $(window).width();
    var drewschartElement = document.getElementById("drewschart");
    chart = new CanvasJS.Chart("drewschart", {
        toolTip: {
            shared: true
        , }
        , legend: {
            dockInsidePlotArea: true
            , verticalAlign: "center"
            , horizontalAlign: "right"
        }
        , axisY: {
            minimum: overView.RealStartTime
            , maximum: overView.RealEndTime
            , labelFormatter: function (e) {
                return ''
            }
            , tickLength: 0
            , interval: (overView.RealEndTime - overView.RealStartTime) / 5
            , labelWrap: true
            , /*labelMaxWidth: 80, */
        }
        , axisX: setup_axis_x_options(overView.Tracks)
        , data: setup_chart_options(overView.Tracks)
    });
    chart.render();
}

function setup_axis_x_options(t) { //function to set up the axis scales - called by load_chart
    var axisOptions = []
    for (var i = 0; i < t.length; i++) {
        axisOptions[i] = {
            minimum: t[i].xAxisStart
            , maximum: t[i].xAxisEnd
            , valueFormatString: " ", //  <- no labels on x
            tickLength: 0
            , labelFontSize: 0
        , }
    }
    axisOptions[t.length] = { /*This Data Series is for the selection*/
        minimum: 0
        , maximum: 100
        , valueFormatString: " ", //  <- no labels on x
        tickLength: 0
        , labelFontSize: 0
    , }
    return axisOptions;
}

function setup_chart_options(t) { //function to put all the data in chart  - called by load_chart
    // collect data
    var data = [];
    for (var i = 0; i < t.length; i++) {
        data[i] = {
            label: t[i].Name
            , color: colorposition_tocolor(t[i].colorposition)
            , type: "line"
            , axisXIndex: i
        , }
        if (t[i].status != 0) {
            data[i].dataPoints = t[i].coordinates;
        }
        data[t.length] = { /*This Data Series is for the selection*/
            label: 'Selection'
            , color: 'rgb(200,255 ,0)'
            , type: "rangeArea"
            , axisXIndex: t.length
            , dataPoints: [
                /*  // Y: [Low, High]
				{x: 5, y:[overView.RealStartTime, overView.RealEndTime]},
				{x: 95, y:[overView.RealStartTime, overView.RealEndTime]}
			*/
                ]
        }
    }
    return data;
}


$('#viewTimeAxis').change(function () {
    if ($(this).is(':checked')) {
        /*This if statement checks to see if the log covers more than 1 day*/
        if ((chart.options.axisY.maximum - chart.options.axisY.minimum) > (1000 * 60 * 60 * 24)) {
            chart.options.axisY.labelFormatter = function (e) {
                return CanvasJS.formatDate(new Date(e.value * -1), "MM/DD HH:mm");
            }
            chart.options.axisY.labelMaxWidth = 99 /*This bumps it to 2 lines*/
        }
        else {
            chart.options.axisY.labelFormatter = function (e) {
                return CanvasJS.formatDate(new Date(e.value * -1), "HH:mm");
            }
            chart.options.axisY.labelMaxWidth = 100
        }
    }
    else {
        chart.options.axisY.labelFormatter = function (e) {
            return '';
        }
    }
    chart.render()
})



$('#viewDataSeries').change(function () {
    if ($(this).is(':checked')) {
        showDataLabels = true
    }
    else {
        showDataLabels = false
    };
    chart.options.data.forEach(function (data) {
        if (data.dataPoints !== undefined && data.dataPoints !== []) {
            data.showInLegend = showDataLabels
        }
        else {
            data.showInLegend = false
        }
    });
    chart.render()
})



function HandleTrackClick(name, index, listElement) { //Build Modal on track click
    //if status was 0 / disabled
    if (overView.Tracks[index].status == 0) {
        $(listElement).find('.status_indicator').addClass('green');
        var body = $('<div class="text-center" data-index="' + index + '">\
            <div id="color_select_box" style="padding: 15px">\
                <div id="range_slider" class="slider" style="background-color: white"></div>\
            </div>\
            <div style="padding: 5px">\
  <div id="scale_txt">SCALE</div>\
                    <div id="left_scale_value" style="float: left">legt</div>\
                   <div id="right_scale_value" style="float: right">right</div>\
            </div>\
            <div id="ZOOM_TXT" style="padding: 10px">ZOOM</div>\
         <div id="range_slider2" class="slider"></div>\
  <div id="OFFSET_TXT" style="padding: 10px">OFFSET</div>\
 <div id="range_slider3" class="slider"></div>\
            </div>');
        $('#TrackPropertiesModal .modal-title').html(name);
        $('#TrackPropertiesModal .modal-body').html(body);
        $('#TrackPropertiesModal').modal('show');
    }
    else {
        $(listElement).find('.status_indicator').removeClass('green');
    }
    toggle_activate(index);
}

function toggle_activate(index) { // This is the button to turn tracks on and off
    // enable
    if (overView.Tracks[index].status == 0) {
        turnTrackOn(index)
    }
    else {
        //disable
        turnTrackOff(index)
    }
    chart.render();
}

function turnTrackOn(i) {
    overView.Tracks[i].status = 1;
    chart.options.data[i].dataPoints = currentVisibleObject.Tracks[i].coordinates;
    chart.options.data[i].legendText = overView.Tracks[i].Name
    chart.options.data[i].showInLegend = showDataLabels
}

function turnTrackOff(i) {
    overView.Tracks[i].status = 0;
    chart.options.data[i].dataPoints = [];
    chart.options.data[i].showInLegend = false
}

function colorposition_tocolor(x) {
    var red = Math.round(Math.abs(Math.sin(x)) * 255);
    var blue = Math.round(Math.abs(Math.sin(3 * x)) * 255);
    var green = Math.round(Math.abs(Math.sin(9 * x)) * 255);
    var color = 'rgb(' + red + ',' + blue + ' ,' + green + ')';
    return color
}

function adjust_chartjsHeight() { // function when window viewport is changed
    var deviceHeight = $(window).height();
    var offset = overView.Tracks.length * 7
    $('#drewschart').height(deviceHeight + offset);
    var container_height = deviceHeight;
    $("#chart_container").css({
        'max-height': container_height + 'px'
        , 'height': container_height + 'px'
    });
    chart.render();
}
$('#timeSpanModal').on('shown.bs.modal', function () { //event raised when modal is shown
    load_timeSpan_slider(); //timeSpan slider
    load_timeSpan_slider2()
});
var windowInSeconds
var spread
var startTime
var timeSliderPosition

function load_timeSpan_slider() { // This created the Time Span slider bar
    var chart_height = $('#drewschart').height();
    $('#time_span_bar .content').height(chart_height - 200);
    var html5Slider = $('#time_span_bar .content')[0];
    var fifteenMin = (1000 * 60 * 15); /*15 minutes*/
    spread = Math.abs(overView.RealEndTime - overView.RealStartTime)
    noUiSlider.create(html5Slider, {
        start: fifteenMin
        , orientation: "vertical"
        , connect: true
        , range: {
            'min': fifteenMin
            , '20%': Math.floor(fifteenMin + (spread * 0.002))
            , '40%': Math.floor(fifteenMin + (spread * 0.04))
            , '60%': Math.floor(fifteenMin + (spread * .16))
            , '80%': Math.floor(fifteenMin + (spread * .32))
            , 'max': spread + fifteenMin
        }
    , });
    html5Slider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider
        windowInSeconds = values[0] / 1000
        var Minutes = Math.floor(windowInSeconds / (60)) % 60
        var Hours = Math.floor(windowInSeconds / (60 * 60)) % 24
        var Days = Math.floor(windowInSeconds / (60 * 60 * 24))
        if (Days > 0) {
            $('#windowLabel').html(Days + " days " + Hours + " hours")
        }
        else if (Hours > 0) {
            $('#windowLabel').html(Hours + " hours " + Minutes + " minutes")
        }
        else {
            $('#windowLabel').html(Minutes + " minutes")
        }
        updateStartTime()
    });
}

function updateStartTime() {
    var windowInMili = windowInSeconds * 1000
    var range = spread - windowInMili
    startTime = (overView.RealStartTime * -1) - Math.floor(range * timeSliderPosition + windowInMili)
    var endtime = startTime + windowInMili
    endtime *= -1
    startTime *= -1
    $('#locationLabel').html(chopDate(new Date(startTime)))
    chart.options.data[overView.Tracks.length].dataPoints = [ // Y: [Low, High]
        {
            x: 2
            , y: [startTime, endtime]
        }
        , {
            x: 98
            , y: [startTime, endtime]
        }
			]
    chart.render()
}

function load_timeSpan_slider2() { // This created the Time Span slider bar
    var chart_height = $('#drewschart').height();
    $('#time_span_bar2 .content').height(chart_height - 200);
    var html5Slider = $('#time_span_bar2 .content')[0];
    noUiSlider.create(html5Slider, {
        start: 0
        , orientation: "vertical"
        , connect: true
        , range: {
            'min': 0
            , 'max': 1
        }
    , });
    html5Slider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider
        timeSliderPosition = values[0]
        updateStartTime()
    });
}
$('#TrackPropertiesModal').on('shown.bs.modal', function () { //event raised when modal is shown
    load_range_slider(); //color slider
    load_range_slider2(); //x axis zoom
    load_range_slider3(); //x axis offset
});

function load_range_slider() { // this is the slider that selects the color
    var html5Slider = document.getElementById('range_slider');
    var trackIndex = $(html5Slider).closest('[data-index]').attr('data-index');
    noUiSlider.create(html5Slider, { // creation of the color slider
        start: overView.Tracks[trackIndex].colorposition
        , connect: true
        , range: {
            'min': 0
            , 'max': 1.57079632679
        }
    , });
    html5Slider.noUiSlider.on('update', function (values, handle) { // event for the color slider
        //console.log('slider update', this);
        var target = this.target;
        var trackIndex = $(target).closest('[data-index]').attr('data-index');
        var x = values[0];
        var color = colorposition_tocolor(x)
        overView.Tracks[trackIndex].colorposition = x
        $("#TrackPropertiesModal #color_select_box").css('background-color', color);
        chart.options.data[trackIndex].color = color;
        chart.render();
    });
}

function load_range_slider2() { // this is the slider to adjust the x axis zoom
    var html5Slider = document.getElementById('range_slider2');
    var target = html5Slider
    var trackIndex = $(target).closest('[data-index]').attr('data-index');
    noUiSlider.create(html5Slider, { // this is the creation of the x axis scale slider
        start: 20
        , range: {
            'min': 0
            , 'max': 100
        }
    , });
    html5Slider.noUiSlider.on('update', function (values, handle) { // this is the event when x axis scale slider is moved
        var value1 = values[0];;
        var range = (overView.Tracks[trackIndex].farRightXAxis - overView.Tracks[trackIndex].farLeftXAxis) * 2
        center = (((overView.Tracks[trackIndex].xAxisEnd - overView.Tracks[trackIndex].xAxisStart) / 2) + overView.Tracks[trackIndex].xAxisStart * 1)
        overView.Tracks[trackIndex].xAxisStart = (center - (range * value1) / 100)
        overView.Tracks[trackIndex].xAxisEnd = (center + (range * value1) / 100)
        $('#left_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisStart * 100) / 100);
        $('#right_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisEnd * 100) / 100);
        chart.options.axisX[trackIndex].minimum = overView.Tracks[trackIndex].xAxisStart
        chart.options.axisX[trackIndex].maximum = overView.Tracks[trackIndex].xAxisEnd
        chart.render()
    });
}
var center

function load_range_slider3() { // this is the slider to adjust the x axis offset
    var html5Slider = document.getElementById('range_slider3');
    var target = html5Slider
    var trackIndex = $(target).closest('[data-index]').attr('data-index');
    noUiSlider.create(html5Slider, { // this is the creation of the x axis scale slider
        start: 0
        , range: {
            'min': -50
            , 'max': 50
        }
    , });
    html5Slider.noUiSlider.on('update', function (values, handle) { // this is the event when x axis scale slider is moved
        var value1 = values[0];;
        var range = (overView.Tracks[trackIndex].xAxisEnd - overView.Tracks[trackIndex].xAxisStart)
        overView.Tracks[trackIndex].xAxisStart = (center - range / 2) + (value1 * range / 100)
        overView.Tracks[trackIndex].xAxisEnd = (center + range / 2) + (value1 * range / 100)
        $('#left_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisStart * 100) / 100);
        $('#right_scale_value').html(Math.round(overView.Tracks[trackIndex].xAxisEnd * 100) / 100);
        chart.options.axisX[trackIndex].minimum = overView.Tracks[trackIndex].xAxisStart
        chart.options.axisX[trackIndex].maximum = overView.Tracks[trackIndex].xAxisEnd
        chart.render()
    });
}