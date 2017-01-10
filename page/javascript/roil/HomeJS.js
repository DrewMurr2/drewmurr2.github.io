var rig = 'Savanna_801_4_ii'
var reloadEverythingTimer
var overView

$('#logsbutton').click(function(){
   $('#homepage').addClass('incognito')
  $('#valuespage').addClass('incognito')
    $('#logpage').removeClass('incognito')
    loadLogsPageMenu()
})
    
    
$('#valuesbutton').click(function(){
     $('#homepage').addClass('incognito')
  $('#logpage').addClass('incognito')
    $('#valuespage').removeClass('incognito')

})

$('#homepagebutton').click(function(){
     $('#valuespage').addClass('incognito')
  $('#logpage').addClass('incognito')
    $('#homepage').removeClass('incognito')

})



$(window).ready(function () {
      load_Everything(load_Everything_callback)
    viewHeight = window.innerHeight
});


function load_Everything(success_callback) {
var options

if(overView === undefined || overView.CurrentWindow === undefined || overView.CurrentWindow.SetStart === undefined){
options = {
        url: "https://roilapi.azurewebsites.net/api/Everything?Rig=" + rig,
        type: "GET",
    }
} else {
    if(overView.CurrentWindow.SetEnd === undefined){
     options = {
        url: "https://roilapi.azurewebsites.net/api/Everything?Rig=" + rig + "&Start=" + overView.CurrentWindow.SetStart,
        type: "GET",
    }   
    }else{
     options = {
        url: "https://roilapi.azurewebsites.net/api/Everything?Rig=" + rig+ "&Start=" + overView.CurrentWindow.SetStart + "&End=" + overView.CurrentWindow.SetEnd,
        type: "GET",
    }   
    }
    
}
    $.ajax(options).success(function (response) {
        var tempO = JSON.parse(response);
        ConvertingDatesANDGeneratingCoordinates(tempO)
        overView = tempO
            if(success_callback !== undefined){success_callback(overView)}     
    });
}



function load_Everything_callback(Overview){
        load_valuesPage()
        load_logsPage()
        reloadEverythingTimer = setInterval(load_Everything,15000)
}



function ConvertingDatesANDGeneratingCoordinates(tempO){
    convertDates(tempO);
    generate_coordinates(tempO);
    convertDates(tempO.Latest)
    generate_coordinates(tempO.Latest)
    convertDates(tempO.CurrentWindow)
    generate_coordinates(tempO.CurrentWindow)
}


function convertDates(obj){
    var realDates = []
    var i = 0
    obj.DateTime.Dates.forEach( function(JSONdate){
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

