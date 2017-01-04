var rig = 'Savanna_801_4_ii'
var Tracks
var loadValuesTimer

$(window).ready(function () {
    load_tracks(load_tracks_callback);

});

function load_tracks_callback() {
    load_time_span_bar()
    loadValuesTimer = setInterval(load_values, 1000);
   }


function load_tracks(success_callback) { // imports column names and populates the html elements
    console.log('load_tracks(success_callback) ')
    var options = {

        url: "http://localhost:14246/returnTracks.vbhtml?rig=" + rig,
        type: "POST",

    };


    $.ajax(options).success(function (response) {

        Tracks = JSON.parse(response);
             
        var RowOptions = {
          color: [['darkgrey', 'lightgray'],
           ['darkkhaki', 'lightgoldenrodyellow']],
           index: 0
        }
        

        function createRow(track) {
            return '<div class="row">\
            <div class="col-sm-6" style="background-color:' + RowOptions.color[RowOptions.index][0] + '; border:double">\
                <p style="font-size:x-large; padding:10px">' + track.name + '</p>\
            </div>\
            <div class="col-sm-6" style="background-color:' + RowOptions.color[RowOptions.index][1] + '; border:double">\
                <p  id="' + track.name + '"style="font-size:x-large; padding:10px">' + track.val + '</p>\
            </div>\
        </div>'           
          
       }
        
      
        //var htmll = '<h1 class="text-center" id="DateTime" style="border:double; padding:10px; width:full">' + chopDate(parseJsonDate(Tracks.DateTime)) + '</h1>'
        $('#DateTime').html(chopDate(parseJsonDate(Tracks.DateTime)))
        var htmll = ""
        Tracks.Tracks.forEach(function (track) {

           htmll += createRow(track)
           RowOptions.index = (RowOptions.index + 1) % 2;

        })

        $('#values_container').html(htmll)

        success_callback()
    });

}
function parseJsonDate(jsonDateString) {
    return new Date(parseInt(jsonDateString.replace('/Date(', '')));
}
function chopDate(date) {
    var str = date + "" //conversion to string
   return str.slice(4, 24);
}

function load_values() { // imports the values
    console.log('load_values(success_callback)')

    var options = {

        url: "http://localhost:14246/returnTracks.vbhtml?rig=" + rig,
        type: "POST",

    };


    $.ajax(options).success(function (response) {

        Tracks = JSON.parse(response);

        $('#DateTime').html(chopDate(parseJsonDate(Tracks.DateTime)))
        Tracks.Tracks.forEach(function (track) {

            $('#' + track.name).html(track.val)
            
        })

       
    });

}

function load_time_span_bar() { // This creates the Time Span slider bar

    $('#select_time_slider').height(400);
    var html5Slider = $('#select_time_slider')[0];

    noUiSlider.create(html5Slider, {
        start: [5],
        orientation: "vertical",
        range: {
            'min': 0,
            'max': 10
        },
    });

    html5Slider

    //html5Slider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider

    //    var newStartTime = convertNegativeNumbertoDateTime(values[0])
    //    var newEndTime = convertNegativeNumbertoDateTime(values[1])
    //    var toplabel = newStartTime.year + '/' + newStartTime.month + '/' + newStartTime.day + ' - ' + newEndTime.year + '/' + newEndTime.month + '/' + newEndTime.day
    //    var labelone = newStartTime.hour + ':' + newStartTime.minute
    //    var labelthree = newEndTime.hour + ':' + newEndTime.minute


    //    updateIndexlabels(toplabel, labelone, labelthree)

    //});

}
