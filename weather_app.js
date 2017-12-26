/**
 * Created by sivar on 12/11/2017.
 */
var APPID = "6daedad54d51a473c534f108d9231174";
var temp;
var loc;
var icon;
var humidity;
var wind;
var direction;
var date;
var sunrise;
var sunset;
var forecastdays;
var forecastUpdates;
var description;
var weekdays = new Array(14);
weekdays[0] =  "Sunday";
weekdays[1] = "Monday";
weekdays[2] = "Tuesday";
weekdays[3] = "Wednesday";
weekdays[4] = "Thursday";
weekdays[5] = "Friday";
weekdays[6] = "Saturday";
weekdays[7] =  "Sunday";
weekdays[8] = "Monday";
weekdays[9] = "Tuesday";
weekdays[10] = "Wednesday";
weekdays[11] = "Thursday";
weekdays[12] = "Friday";
weekdays[13] = "Saturday";
var tables;
window.onload = function () {
    temp = document.getElementById("temperature");
    loc = document.getElementById("location");
    icon = document.getElementById("icon");
    humidity = document.getElementById("humidity");
    wind = document.getElementById("wind");
    direction = document.getElementById("direction");
    forecastdays = document.getElementById("forecast-panel").querySelectorAll("h2");
    forecastUpdates = document.getElementById("forecast-panel").querySelectorAll(".forecast-updates");
    tables = document.getElementById("forecast-panel").querySelectorAll(".updates-table");
    /* NEW */
    sunrise = document.getElementById("sunrise");
    sunset = document.getElementById("sunset");
    description = document.getElementById("description");
    if(navigator.geolocation){
	var showPosition = function(position){
	    updateByGeo(position.coords.latitude, position.coords.longitude);
	}
	navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
	var zip = window.prompt("Could not discover your location. What is your zip code?");
	updateByZip(zip);
    }

}

function getSelectedValue(){
    var place = document.getElementById("searchfield").value;
    var option = document.getElementById("option").value;
    for(var i = 0; i < tables.length; i++){
        var rowCount = tables[i].rows.length;
        for (var j = rowCount - 1; j > 0; j--) {
            tables[i].deleteRow(j);
        }
    }
    if(option == "zipcode"){
        updateByZip(place);
    console.log("Inside get Selected Value");
    }
    else if(option == "cityname"){
        updateByCity(place);
    }

}

function updateByZip(zip){
    var url = "http://api.openweathermap.org/data/2.5/weather?" +
	"zip=" + zip +
	"&APPID=" + APPID;
    console.log("This is URL1");
    sendRequest(url, extractCurrent);
    var url2 = "http://api.openweathermap.org/data/2.5/forecast?" +
	"zip=" + zip +
	"&APPID=" + APPID;
    console.log("This is URL2");
    sendRequest(url2, extractForecast);
}


function updateByGeo(lat, lon){
    var url = "http://api.openweathermap.org/data/2.5/weather?" +
	"lat=" + lat +
	"&lon=" + lon +
	"&APPID=" + APPID;
    sendRequest(url, extractCurrent);
    var url2 = "http://api.openweathermap.org/data/2.5/forecast?" +
	"lat=" + lat +
	"&lon=" + lon +
	"&APPID=" + APPID;
    sendRequest(url2, extractForecast);
}
function updateByCity(place) {
    var url = "http://api.openweathermap.org/data/2.5/weather?" +
    "q=" + place +
	"&APPID=" + APPID;
    sendRequest(url, extractCurrent);
    var url2 = "http://api.openweathermap.org/data/2.5/forecast?" +
    "q=" + place +
	"&APPID=" + APPID;
    sendRequest(url2, extractForecast);

}
function extractCurrent(xhttp){
        console.log("This is ExtractCurrent");
        var currentData = JSON.parse(xhttp.responseText);
        var weather = {};
	    weather.code = currentData.weather[0].id;
	    weather.humidity = currentData.main.humidity;
	    weather.wind = currentData.wind.speed;
	    /* NEW */
	    weather.direction = degreesToDirection(currentData.wind.deg)
	    weather.location = currentData.name;
	    /* NEW */
	    weather.temp = K2F(currentData.main.temp);
		weather.icon = currentData.weather[0].icon;
		weather.date = Date(currentData.dt*1000);
		var riseDate = new Date(0);
		riseDate.setUTCSeconds(currentData.sys.sunrise);
		weather.riseTime  = riseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	    var setDate = new Date(0);
		setDate.setUTCSeconds(currentData.sys.sunset);
		weather.setTime  = setDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        weather.description = currentData.weather[0].description;
		update(weather);
}


function extractForecast(xhttp){
            console.log("This is extractForecast");
            var forecastData = JSON.parse(xhttp.responseText);
            var count = forecastData.cnt;
            var d = new Date(0);
            d.setUTCSeconds(forecastData.list[0].dt);
            var day = d.getDay();
            for (var i = 0; i < forecastdays.length; i++) {
                forecastdays[i].innerHTML =  weekdays[day + i] ;
            }

            var counter = 0;
            var tableCounter = 0;
            for(var i = 0; i < count; i++){
                var datePanel = new Date(0);
                datePanel.setUTCSeconds(forecastData.list[i].dt);
                var myDay = weekdays[datePanel.getDay()];
                var myTime  = datePanel.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                if(myDay == forecastdays[counter].innerHTML ){
                        updateForecastTables(counter, forecastData, myTime, i);
                        }
                else{
                    counter++;
                    updateForecastTables(counter, forecastData, myTime, i);
                    }
            }
}

function updateForecastTables(tableCounter, forecastdata, myTime, i){
    console.log("This is updating tables");
    var imgSrc = "http://openweathermap.org/img/w/" + forecastdata.list[i].weather[0].icon + ".png";
    var row = tables[tableCounter].insertRow(-1);
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	var cell5 = row.insertCell(4);
	cell1.innerHTML = myTime;
	cell2.innerHTML = K2F(forecastdata.list[i].main.temp) + String.fromCharCode(176)+ "F";
	cell3.innerHTML = "<img src = \"" + imgSrc + "\"" +"height = \"25px \" " + "/>";
    cell4.innerHTML = forecastdata.list[i].weather[0].description;
    cell5.innerHTML = forecastdata.list[i].wind.speed + " Mph " + degreesToDirection(forecastdata.list[i].wind.deg);
}

function sendRequest(url, myFunc){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            myFunc(this);
            }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function degreesToDirection(degrees){
    var range = 360/16;
    var low = 360 - range/2;
    var high = (low + range) % 360;
    var angles = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    for( i in angles ) {
	if(degrees >= low && degrees < high){
	    return angles[i];
	}
	low = (low + range) % 360;
	high = (high + range) % 360;
    }
    return "N";
}

function K2F(k){
    return Math.round(k*(9/5)-459.67);
}

function K2C(k){
    return Math.round(k - 273.15);
}

function update(weather) {
	icon.src = "http://openweathermap.org/img/w/"+ weather.icon +".png";
    humidity.innerHTML = weather.humidity;
    wind.innerHTML = weather.wind;
    direction.innerHTML = weather.direction;
    loc.innerHTML = weather.location;
    temp.innerHTML = weather.temp;
	date = weather.date;
	sunrise.innerHTML = weather.riseTime;
	sunset.innerHTML = weather.setTime;
	description.innerHTML = weather.description;
}



