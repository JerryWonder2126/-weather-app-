/* eslint-disable prettier/prettier */
/* eslint-disable */
$(document).ready(function(){
    
    let divs = {    //an object that contains needed divs(containers)
        def_lat: '74',    //default longitude, just in case IP data API is unavailable
        def_lon: '-31',    //default longitude, just in case IP data API is unavailable
        valid: true,  //a boolean to tell if forecast data stored in local storage is up to date
        schedule_check: false,    //used to control the firing of gen_list function
        location: true,            //used to check if user allowed access to location, changes to false if user denies access
        smash_boxes: document.getElementById('smash-slides'),
        search_display_div: document.getElementById('smash_request'),
        not_found: document.querySelector('#not-found'),
        no_connection: document.querySelector('#no-connection'),
        search_field: document.querySelector('#search-text'),
    }
    
    let contains_class = function (div, klass){
        return div.classList.contains(klass);
    }
    
    let animate_click = async function(){
        let smash_cont = document.querySelector('#smash_container');
        let loader = document.querySelector('#loader');
        if(contains_class(loader, 'hidden')) loader.classList.remove('hidden');
        if(contains_class(smash_cont, 'clear')) smash_cont.classList.remove('clear');
        if(!contains_class(smash_cont, 'dim')) smash_cont.classList.add('dim');
        
    }
    
    let deanimate_click = function(){
        let smash_cont = document.querySelector('#smash_container');
        let loader = document.querySelector('#loader');
        if(contains_class(smash_cont, 'dim')) smash_cont.classList.remove('dim');
        if(!contains_class(loader, 'hidden')) loader.classList.add('hidden');
        if(!contains_class(smash_cont, 'clear')) smash_cont.classList.add('clear');
        
    }

    let proc_gmt = function(time_stamp){
        /* processes timestamp and returns in the amount of 
        elapsed secs,mins,days,weeks,months or years */
        let secs = Math.abs(Date.now() - time_stamp)/1000;
        let res = "";
        if(secs>=60 && secs<3600){
            //i.e still less than an hour
            res = parseInt(secs/60) + " min(s) ago";
        }else if(secs>=3600 && secs<86400){
            //i.e still less than a day 
            res = parseInt(secs/3600) + " hr(s) ago";
        }else if(secs>=86400 && secs<604800){
            //i.e still less than a week
            res = parseInt(secs/86400) + " day(s) ago";
        }else if(secs>=604800 && secs<2419200){
            //i.e still less than a month
            res = parseInt(secs/604800) + " week(s) ago";
        }else if(secs>=2419200 && secs<29030400){
            //i.e still less than a year
            res = parseInt(secs/2419200) + " month(s) ago";
        }else if(secs>=29030400){
            //i.e more than or equal to a year
            res = parseInt(secs/29030400) + " year(s) ago";
        }else{
            //i.e still less than a minute
            res = parseInt(secs) + " sec(s) ago";
        }
        return res;
    }

    let proc_gmt_days = function(time_stamp){
        /* processes timestamp and returns the amount of days from now */
        let stamp_day = Number(new Date(time_stamp).getDate());
        let day_diff = Math.abs(stamp_day - new Date().getDate());
        let month_diff = Math.abs(new Date(time_stamp).getMonth() - new Date().getMonth());
        let res = "";
        if(month_diff > 0){//i.e time_stamp falls into a succeding month
            if(month_diff === 1){// time_stamp falls into the next month
                console.log("here");
                if(stamp_day === 1){//i.e next day is the first day of the next month
                    res = "tomorrow";
                }else{
                    day_diff = parseInt(Math.abs(Date.now()-time_stamp)/86400) + 1;
                    res = `${day_diff} days from now`;
                }
            }else{//i.e time_stamp falls farther than a month
                day_diff = parseInt(Math.abs(Date.now() - time_stamp)/86400);
                res = `${day_diff} days from now`;
            }   
        }else if(day_diff === 0){
            res = "today";
        }else if(day_diff === 1){
            res = "tomorrow";
        }else{
            res = `${day_diff} days from now`;
        }
        return res;
    }

    let handle_response = async function(url, lat , lon){
        //processes data (json response) from retrieve_data function (one call API) and returns a JSON object
        let response = await retrieve_data(url, lat, lon);
        let json = await response.json();
        try{
            if (!response.ok) {
                const error = {
                    status: response.status,
                    statusText: response.statusText
                }
                return Promise.reject(error);
            }
            return json
        }catch(error){
            throw new Error(error);
        }
    }
    
    let retrieve_data = async function(url, lat, lon){
        //retrieves data from one call API and returns the response
        /*One call API format
        https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&
        exclude={part}&appid={YOUR API KEY}*/
        if (!url){
            url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=f16f5069fd7086051ded89bf67c0c6e5`;     
        }
        let the_response = await fetch(url);
        animate_click();
        return the_response;
    }

    let display_error_in_connection_msg = function () {
        if(divs.no_connection.classList.contains('hidden')){
            divs.no_connection.classList.remove('hidden');
        }
    }
    
    let hide_error_in_connection_msg = function () {
        if(!divs.no_connection.classList.contains('hidden')){
            divs.no_connection.classList.add('hidden');
        }
    }

    let display_not_found_msg = function () {
        if(divs.not_found.classList.contains('hidden')){
            divs.not_found.classList.remove('hidden');
        }
    }
    
    let hide_not_found_msg = function () {
        if(!divs.not_found.classList.contains('hidden')){
            divs.not_found.classList.add('hidden');
        }
    }
    
    let date_div = function get_date(){
        //This function displays the date on the header
        let [month, date, year] = ( new Date(Date.now()) ).toLocaleDateString().split("/");
        let [hour, minute, second] = ( new Date(Date.now()) ).toLocaleTimeString().slice(0,7).split(":");
        let date_info = hour + "hr : " + minute + "min : " + second + "sec<br/>";
        date_info += date + "/" + month + "/" + year;
        $('.date-text').html(date_info);
    }
    window.setInterval(date_div, 1000);    //This is to make the date_div function run every seconds. Produces the time functionality
    
    (function(){
        //A function to automatically update the copyright section of the page
        let copy_div = document.querySelector('#copy-rite');
        let present = new Date().getFullYear();
        if(present !== 2020){
            copy_div.innerHTML = "WatchOut &copy 2020-" + present.toString();
        }
    })();
    
    let retrieve_from_storage = function(){
        //returns an object that contains forecasts retrieved from local storage
        let returned_data = new Object();
        Array.from(['today_2', 'today_3', 'today_4', 'today_5', 'today_6', 'today_7', 'today_8', 'today', 'retrieved_time'])
        .forEach(function(value, index, array){
            returned_data[value] = localStorage.getItem(value);
        });
        return returned_data;
    }

    let add_unit = function(obj_data){
        /* Sumply to add units to the data gotten from API and also change the way the data is arranged (applies to forecast) */
        let modify_list = {
            "temp": "°C", 
            "pressure": "hPa", 
            "humidity": "%", 
            "feels_like": "°C", 
            "clouds": "%"
        };
        Object.keys(modify_list).forEach(function(value_s){
            field = obj_data[value_s];
            if(typeof(field) === typeof({})){
                if(value_s === "temp"){
                    field = field.max;
                }else if(value_s === "feels_like"){
                    field = field.day;
                }
            }
            obj_data[value_s] = `${field}${modify_list[value_s]}`;
        });
        return obj_data;
    }
    
    async function load_into_storage(){
        try{
            let data = [];    //an array to store retrieved forecast data
            data[0] = await handle_response(false, 23, 11);
            console.log(data[0]);
            data.push((new Date()).getTime());    //push timestamp of action
            localStorage.setItem('today', JSON.stringify(add_unit(data[0].current)));
            localStorage.setItem('retrieved_time', data[1])
            Array.from(['today_1', 'today_2', 'today_3', 'today_4', 'today_5', 'today_6', 'today_7', 'today_8'])
           .forEach(function(value, index, array){
               localStorage.setItem(value, JSON.stringify(add_unit(data[0].daily[index]))); 
            });
            return true;
        }catch(error) {
            console.log(error);
            // The resource could not be reached
            display_error_in_connection_msg();
            throw new Error(error);
        }
    }
    
    let change_ipinfo = async function(){
        animate_click();
        //IP API for getting users current location
        let ip_api_key = "a111ced234aafb569f2649007abd6b677483851f518d73e19cbeabbc";
        let ip_data = await fetch("https://api.ipdata.co?api-key=" + ip_api_key + "&fields=latitude,longitude").catch(err => {
            display_error_in_connection_msg();
            deanimate_click();
        });
        if(ip_data.ok){
            let ip_response = await ip_data.json(); //returns an object that contains just latitude and longitude of current position
            divs.def_lat = ip_response.latitude;
            divs.def_lon = ip_response.longitude;
            
            return {lat: ip_response.latitude, lon: ip_response.longitude}
        }   
    };
    
    let check_data_in_storage = async function () {
            
        if(localStorage){
            
            if(!localStorage.getItem('countries')){
                /*if list of countries and their location does not exist in local storage
                then retrieve it through the rest countries api */
                let response_ctry = await fetch("https://restcountries.eu/rest/v2/all?fields=name;latlng");
                if (response_ctry.ok) {
                    json = await response_ctry.json();
                    localStorage.setItem('countries', JSON.stringify(json));
                }
                //NOTE: the fetch call fails silently
            }

            weatherData = retrieve_from_storage();
            
            if(!weatherData.retrieved_time){
                /*If retrieved_time doesn't exist in local storage, it means forecast data 
                have not been loaded or it has been cleared so we run the load_into_storage function*/
                animate_click();
                load_into_storage().then(done => {
                    //After load_into_storage is done, then display forecast for today (done through load_sliders())
                    if(done) load_sliders();
                });
                
            }else{
                //if data exists, the if statement checks if it is up-to-date: condition is that last update time must be lower than present time by just three hours
                let saved_date = (new Date(Number(weatherData.retrieved_time)));
                
                if ((new Date().getHours() - saved_date.getHours()) > 3 || saved_date.getDate() !== (new Date().getDate())){
                    animate_click();
                    load_into_storage().then(done => {
                        if(done) load_sliders();
                    });
                }else{
                    load_sliders();
                }      
            }
        }
    }
    
    let page_load = async function(){
        //This function runs on page load, it is used to define user position i.e. latitude and longitude
        animate_click();
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                divs.def_lat = position.coords.latitude;
                divs.def_lon = position.coords.longitude;
                check_data_in_storage().finally(deanimate_click());
            }, function(){
                change_ipinfo().then(res => {
                    divs.def_lat = res.lat;
                    divs.def_lon = res.lon;
                    check_data_in_storage();
                }).finally(deanimate_click());
            });
       }else{
           change_ipinfo().then(check_data_in_storage()).finally(deanimate_click());
       }
    }().catch(err => {
        deanimate_click();
    }).finally(function(){
        deanimate_click();
    });

    let process_search = function(look_up, field){
        animate_click();
        field.disabled = true;
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${look_up}&appid=f16f5069fd7086051ded89bf67c0c6e5`; 
        handle_response(url).then(res => {
            let smash_next = divs.search_display_div.querySelector('.my_card');
            if(!smash_next){
                //If that container already exist, use it else create a new DOM element to hold forecast data
                smash_next = forecast_html_markup(klass=['my_card']);
            }
            document.getElementById('country_name_request').textContent = look_up;
            //Format response and make it ready for display
            let key = "";
            smash_next.querySelectorAll(".details-basic").forEach(function(value,index,array){
                key = value.querySelector(".details-content").getAttribute("data-name");
                if(key === "clouds"){
                    value.querySelector(".details-content").textContent = res.clouds.all;
                }else{
                    value.querySelector(".details-content").textContent = res.main[key];
                }
            });
            smash_next.querySelector(".details-weather")
            .querySelectorAll(".details-content").forEach(function(value, index, array){
                key = value.getAttribute("data-name");
                value.textContent = res.weather[0][key];
            });
            let icon_url = `http://openweathermap.org/img/wn/${res.weather[0].icon}@2x.png`;
            smash_next.querySelector(".details-weather").querySelector("img").setAttribute("src", icon_url);
            divs.search_display_div.append(smash_next);
            if(!contains_class(divs.smash_boxes, 'hidden')) divs.smash_boxes.classList.add('hidden');
            if(contains_class(divs.search_display_div), 'hidden') divs.search_display_div.classList.remove('hidden');
            smash_next.querySelector('.details-time').classList.add('hidden');
        }).catch(err => {
            console.log(err);
            display_not_found_msg();
        }).finally(function(){
            field.value = "";
            field.disabled = false;
            deanimate_click();
        });
    }

    document.querySelector("#back_btn").addEventListener("click", function(){
        $(divs.smash_boxes).show('600', () => {
            $(divs.search_display_div).hide('600');
        });
        hide_not_found_msg();
    });

    // document.querySelector("#search-form").addEventListener("submit", function(e){
    //     e.preventDefault();
    // });
    
    divs.search_field.addEventListener('keyup', function(e){
        e.preventDefault();
        hide_not_found_msg();
        if(divs.schedule_check) clearTimeout(divs.schedule_check);
        if(this.value){
            divs.schedule_check = setTimeout(process_search, 5000, this.value, this);
        } 
    });

    let create_dom_elem = function(tag){
        var new_dom_obj = document.createElement(tag);
        return new_dom_obj;
    }

    let forecast_html_markup = (klass) => {
        //returns an DOM object that contains all of html elements needed to contain forecast data
        //markup is the html_markup that will contain the formated response
        let markup = $('.smash_box_template').html();
        // Create a new DOM object for manipulation
        smash_next = create_dom_elem('div');
        smash_next.innerHTML = $.trim(markup);
        // END of DOM creation
        if(typeof(klass) === 'object'){
            klass.forEach(function(value){
                smash_next.classList.add(value);
            });
        }
        return smash_next;
    }

    let show_full = async function (response) {
        let data = JSON.parse(response);    //turn response into an object
        let retrieved_time = localStorage.getItem("retrieved_time");
        const smash_next = forecast_html_markup(klass=['carousel-item', 'smash_box', 'my_card']);
        smash_next.querySelector("h2").textContent = proc_gmt_days(data.dt*1000);
        let time = proc_gmt(Number(retrieved_time));
        //Format response and make it ready for display
        let key = "";
        smash_next.querySelectorAll(".details-basic").forEach(function(value,index,array){
            key = value.querySelector(".details-content").getAttribute("data-name");
            value.querySelector(".details-content").textContent = data[key];
        });
        smash_next.querySelector(".details-weather")
        .querySelectorAll(".details-content").forEach(function(value, index, array){
            key = value.getAttribute("data-name");
            value.textContent = data.weather[0][key];
        });
        let icon_url = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        smash_next.querySelector(".details-weather").querySelector("img").setAttribute("src", icon_url);
        smash_next.querySelector(".details-time").querySelector(".details-content").textContent = time;
        return smash_next;
    }

    let update_slide_indicator = function(count){
        //Simply to update the indicator in the slider
        let node_obj = create_dom_elem('li');
        $(node_obj).attr('data-target', "#smash-slides");
        $(node_obj).attr('data-slide-to', count);
        $('ol.carousel-indicators').append(node_obj);
        return node_obj;
    }
    
    let load_sliders = function(){
        if(localStorage){
            weatherData = retrieve_from_storage();
            let names = ['today', 'today_2', 'today_3', 'today_4', 'today_5', 'today_6', 'today_7', 'today_8'];
            animate_click();
            names.forEach(function(value, index, array){
                show_full(weatherData[value]).then(function(result){
                    $('.carousel-inner').append(result);
                    update_slide_indicator(index);
                    if((index + 1) == array.length){
                        //Add active class to first carousel-item to make slide active
                        $($('.carousel-item')[0]).addClass('active');
                        $($('ol.carousel-indicators li')[0]).addClass('active');
                    }
                });
            });
            deanimate_click();
        }
    };
});

$('#about-toggler').on('show.bs.collapse', function(){
    console.log('weee');
    // $('.smash_about_note').toggle();
});