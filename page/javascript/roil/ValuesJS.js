var rig = 'Savanna_801_4_ii'
var Latest
var loadValuesTimer
var loadLatestTimer
var viewHeight
var overView
var numberOfrows = 500
var previouslyDisplayedTime

$(window).ready(function () {
      console.log('(window).ready(function ()')
    load_Overview(load_Overview_callback)
    viewHeight = window.innerHeight
});

function load_Overview_callback(Overview){
    console.log('load_Overview_callback')
    populateHTMLelements(Overview)
    load_latest_(function(){
        loadValuesTimer = setInterval(change_values, 1000);
        loadLatestTimer = setInterval(nutting, 5000)
    },15)
    load_time_span_bar()
}


function change_values(){
   for (i=Latest.DateTime.Dates.length - 1;i>=0; i-=1){
       if(parseJsonDate(Latest.DateTime.Dates[i]) > previouslyDisplayedTime){
           updateValues(i,Latest)
           return undefined;
       }
   }
}

function nutting(){ /* console.log('nutting')*/
                  load_latest_(function(){},15)}

//http://localhost:49614/api/latestVals?table=Savanna_801_4_ii&offset=15
function load_latest_(success_callback, number) { // imports column names and populates the html elements
        /*  console.log('load_latest_')*/
    var options = {
        url: "http://roilapi.azurewebsites.net/api/latestVals?table=" + rig + "&offset=" + number,
        type: "GET",
    };

    $.ajax(options).success(function (response) {
        Latest = JSON.parse(response);
             success_callback(Latest)    
    });
}




function load_Overview(success_callback) {
var options = {
        url: "http://roilapi.azurewebsites.net/api/Overview?Rigname=" + rig + "&NumberOfRows=" + numberOfrows,
        type: "GET",
    };  
    $.ajax(options).success(function (response) {
        overView = JSON.parse(response);
             success_callback(overView)    
    });
}




function populateHTMLelements(Overview) {
   var RowOptions = {
          color: [['darkgrey', 'lightgray'],
           ['darkkhaki', 'lightgoldenrodyellow']],
           index: 0
        }
        
   function createRow(track) {
            return '<div class="row">\
            <div class="col-sm-6" style="background-color:' + RowOptions.color[RowOptions.index][0] + '; border:double">\
                <p style="font-size:x-large; padding:10px">' + track.Name + '</p>\
            </div>\
            <div class="col-sm-6" style="background-color:' + RowOptions.color[RowOptions.index][1] + '; border:double">\
                <p  id="' + track.Name + '"style="font-size:x-large; padding:10px">' + track.Values[0] +'</p>\
            </div>\
        </div>'           
          
       }
        
      
        var htmll = ""
        Overview.Tracks.forEach(function (track) {
if(track.Name != 'ID'){
           htmll += createRow(track)
           RowOptions.index = (RowOptions.index + 1) % 2;
}
        })

        $('#values_container').html(htmll) 
        
        updateValues(0,overView)
}




function parseJsonDate(jsonDateString) {
    return new Date(parseInt(jsonDateString.replace('/Date(', ''))+21600000); /*adds 21600000 to correct the timezone - need to implement better solution*/
}




function chopDate(date) {
    var str = date + "" //conversion to string
   return str.slice(4, 24);
}




function updateValues(index,object) { // imports the values
          var thisTime = parseJsonDate(object.DateTime.Dates[index])         
    if(previouslyDisplayedTime === undefined || thisTime > previouslyDisplayedTime){
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
        start: [0],
        orientation: "vertical",
        step: 1,
        range: {
            'min': 0,
            'max': (overView.Tracks[0].Values.length- 1)
        },
    });

    

    html5Slider.noUiSlider.on('update', function (values, handle) { // event for the Time Span slider
 var handlePosition = values[0] * 1

        updateValues(handlePosition, overView)
     

    });

}
