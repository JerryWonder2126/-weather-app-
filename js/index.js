window.onload = function (){
    
    let divs = {
        def_lat: '74',    //default longitude, just in case IP data API is unavailable
        def_lon: '-31',    //default longitude, just in case IP data API is unavailable
        valid: true,  //a boolean to tell if forecast data stored in local storage is up to date
        schedule_check: false,    //used to control the firing of gen_list function
        location: true,            //used to check if user allowed access to location, changes to false if user denies access       //an object that contains needed divs(containers)
        smash_prev: document.getElementById('smash_prev'),
        smash_today: document.getElementById('smash_today'),
        fill_node: document.querySelector('#smash_request'),
        nav_items: document.getElementsByClassName('nav_item'),
        smash_today_box: document.getElementById('smash_today_box'),
        smash_boxes: document.querySelectorAll('smash_box'),
        not_found: document.querySelector('#not-found'),
        no_connection: document.querySelector('#no-connection'),
        main_div: document.querySelector('main'),
        about_div: document.querySelector('#smash_about'),
        contact_div: document.querySelector('#smash_contact'),
        search_field: document.querySelector('#search-text'),
        search_list: document.querySelector('#search-list'),
    }
    
    let query_country = async function (){
        /*Loads countries and their position (json format)from local storage or directly from the rest country API*/
        try{
            if(localStorage){
                return JSON.parse(localStorage.getItem('countries'));
            }else{
                /*API endpoint for countries and thier position
                https://restcountries.eu/rest/v2/all?fields=name;latlng
                */
                let response = await fetch("https://restcountries.eu/rest/v2/all?fields=name;latlng");
                if (!response.ok) {
                    const error = Object.assign({}, json, {
                        status: response.status,
                        statusText: response.statusText
                    });
                    return Promise.reject(error);
                }
                return response.json();
            }
        }catch(error){
            console.log(error);
        }
    }

    let my_toggle = function (klass, conts) {
        //conts is the class to be toggled on node klass
        conts.forEach(function(value, index, array){
            value.classList.toggle(klass);
        });
    }
    
    let deactivate_nav = function () {
        //removes the 'active' class from all nav elements(.nav-item)
        let nav_items = document.getElementsByClassName('nav_item');
        for(let count=0; count<nav_items.length; count++){
            if(contains(nav_items[count], 'active')) nav_items[count].classList.remove('active');
        }
    }
    
    let contains = function (div, klass){
        return div.classList.contains(klass);
    }
    
    let animate_click = async function(){
        let smash_cont = document.querySelector('#smash_container');
        let loader = document.querySelector('#loader');
        if(contains(loader, 'hidden')) loader.classList.remove('hidden');
        if(contains(smash_cont, 'clear')) smash_cont.classList.remove('clear');
        if(!contains(smash_cont, 'dim')) smash_cont.classList.add('dim');
        
    }
    
    let deanimate_click = function(){
        let smash_cont = document.querySelector('#smash_container');
        let loader = document.querySelector('#loader');
        if(contains(smash_cont, 'dim')) smash_cont.classList.remove('dim');
        if(!contains(loader, 'hidden')) loader.classList.add('hidden');
        if(!contains(smash_cont, 'clear')) smash_cont.classList.add('clear');
        
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
        /* processes timestamp and returns the amount of 
        days from now */
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

    let show_full = async function (response, smash_next) {
        animate_click();
        //smash_next is the container that will contain the formated response
        let data = JSON.parse(response);    //turn response into an object
        let retrieved_time = localStorage.getItem("retrieved_time");
        if (typeof(smash_next) === 'undefined'){
            //if smash_next is not defined use #smash_today_box as defualt
            smash_next = document.getElementById('smash_today_box');
        }
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
        smash_next.querySelector(".details-time")
        .querySelector(".details-content").textContent = time;
        
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
        let date_info = "<p>" + hour + "hr : " + minute + "min : " + second + "sec<br/>";
        date_info += date + "/" + month + "/" + year + "</p>";
        document.getElementById('smash_date').innerHTML = date_info;
    }
    setInterval(date_div, 1000);
    
    let update_copyright = function(){
        //A function to automatically update the copyright section of the page
        let copy_div = document.querySelector('#copy-rite');
        let present = new Date().getFullYear();
        if(present !== 2020){
            copy_div.innerHTML = "WatchOut &copy 2020-" + present.toString();
        }
    }();

    let prev_dt = function () {
        //generates an object that contains timestamps for the last four days
        let x = 1
        data = new Array();
        for(;x<5;x++){
            prev = new Date((new Date().getTime()) - ( x * 24 * 3600 * 1000)).getTime();
            prev = Math.floor(prev/1000);
            data.push(prev);
        }
        return data
    }();
    
    let retrieve_from_storage = function (){
        //returns an object that contains forecasts retrieved from local storage
        let returned_data = new Object();
        Array.from(['today_2', 'today_3', 'today_4', 'today_5', 'today_6', 'today_7', 'today_8', 'today', 'retrieved_time'])
        .forEach(function(value, index, array){
            returned_data[value] = localStorage.getItem(value);
        });
        return returned_data;
    }

    let add_unit = function(obj_data){
        /* Sumply to add units to the data gotten from API and also change the way the data is arranged(applies to forecast) */
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
            let dat = '';
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
    
    let show_today = async function(){
        //display current forecast as at last retrieve of data
       animate_click();
       if(!divs.smash_today_box.classList.contains('hidden')) divs.smash_today_box.classList.add('hidden');
        let today_name_node = document.querySelector('#country_name_today');
        if(localStorage){
            weatherData = retrieve_from_storage()
            let names = ['today_2', 'today_3', 'today_4', 'today_5', 'today_6', 'today_7', 'today_8'];
            document.querySelector("#smash_prev").querySelectorAll(".smash_box").forEach(function(value, index, array){
                show_full(weatherData[names[index]], value);
            });
            show_full(weatherData.today)
            .then(function(){
                if(divs.smash_today_box.classList.contains('hidden')) divs.smash_today_box.classList.remove('hidden');
                deanimate_click();
            });
        }
    }

    document.querySelectorAll(".smash_btn").forEach(function(value){
        value.addEventListener("click", function(){
            let action = this.getAttribute("data-action");
            let node_boxes = document.querySelectorAll(".smash_box");
            let curr_index = 0;     //index of current div
            let next_index = 0;    //index of div to be displayed (changed later on)
            let anime ="";          //The animation to be added to the div on click
            node_boxes.forEach(function(value, index){
                if(value.classList.contains("active")){
                    curr_index = index;
                }
            });
            if(action === "previous"){
                next_index = curr_index - 1;
                anime = "left-anime";
            }else{
                next_index = curr_index + 1;
                anime = "right-anime";
            }
            if(next_index<node_boxes.length && next_index>-1){
                node_boxes[curr_index].classList.replace("active", "hidden");
                node_boxes[next_index].classList.replace("hidden", "active");
                node_boxes[next_index].classList.remove("left-anime");
                node_boxes[next_index].classList.remove("right-anime");
                node_boxes[next_index].classList.add(anime);
            }else{
                value.setAttribute("disable", true);
            }
        });
    });
    
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
                //alert(divs.def_lon);
                //alert(divs.def_lat);
                //show_today().finally(deanimate_click());
                
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
                    if(done) show_today().catch(deanimate_click()).finally(deanimate_click());
                });
                
            }else{
                //if data exists, the if statement checks if it is up-to-date: condition is that last update time must be lower than
                let saved_date = (new Date(Number(weatherData.retrieved_time)));
                
                if ((new Date().getHours() - saved_date.getHours()) > 3 || saved_date.getDate() !== (new Date().getDate())){
                    animate_click();
                    //alert('good');
                    load_into_storage().then(done => {
                        if(done) show_today().finally(deanimate_click());
                    });
                }else{
                    animate_click();
                    show_today().finally(deanimate_click());
                }      
            }
        
        }
    }
    
    let page_load = async function(){
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
        
    let country_obj = async function () {
        /*An object that processes response from query_country(rest countries API) and returns 
        an object that contains countries(as keys) and position(as values in format[lat,lon])
        The object also contains an array of country names*/
        try{
            
            let data_country = await query_country();       
            let countries = new Object();
            let key = '';
            let keys_array = []    //initiator for an array that will contain names of countries(unformatted)
            data_country.forEach(function(value, index, array){
                keys_array.push(value.name);
                key = value.name.replace(' ', '').toLowerCase();//strip off spaces in name and convert to lowercase
                countries[key] = value.latlng;
            });
            countries.keys_array = keys_array;
            return countries;
        }catch(err){
            //if there is any error here fail silently
        console.log(err);
        }
    }();
    let process_search = function(look_up, field){
        animate_click();
        field.disabled = true;
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${look_up}&appid=f16f5069fd7086051ded89bf67c0c6e5`; 
            handle_response(url).then(res => {
                let smash_next = document.querySelector('#request-info');
                document.querySelector('#country_name_request').textContent = look_up;
                let smash_boxes = document.querySelector("#smash_boxes");
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
                if(!contains(smash_boxes, 'hidden')) smash_boxes.classList.add('hidden');
                if(contains(divs.fill_node, 'hidden')) divs.fill_node.classList.remove('hidden');
                if(!contains(divs.fill_node, 'left-anime')) divs.fill_node.classList.add('left-anime');
                deactivate_nav();
            }).catch(err => {
                display_not_found_msg();
            }).finally(function(){
                field.value = "";
                field.disabled = false;
                deanimate_click();
                //if(!spinner.classList.contains('hidden')) spinner.classList.add('hidden');
                
            });
    }
    document.querySelector("#back_btn").addEventListener("click", function(){
        let smash_boxes = document.querySelector("#smash_boxes");
        if(contains(smash_boxes, 'hidden')) smash_boxes.classList.remove('hidden');
        if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
        if(!contains(smash_boxes, 'left-anime')) smash_boxes.classList.add('left-anime');
        hide_not_found_msg();
        deactivate_nav();
    });

    document.querySelector("#search-form").addEventListener("submit", function(e){
        e.preventDefault();
    });
    
    divs.search_field.addEventListener('keyup', function(e){
        e.preventDefault();
        hide_not_found_msg();
        if(divs.schedule_check) clearTimeout(divs.schedule_check);
        if(this.value){
            divs.schedule_check = setTimeout(process_search, 5000, this.value, this);
        } 
    });
    
    // document.getElementById('home').addEventListener('click', function(){
    //     document.getElementById("smash_boxes").focus({preventScroll: false});
    //     if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');            
    //     if(!divs.valid){
    //         if(divs.out_of_date.classList.contains('hidden')) divs.out_of_date.classList.remove('hidden');  
    //     }
    //     if(!contains(divs.smash_today, 'left-anime')) divs.smash_today.classList.add('left-anime');
    //     deactivate_nav();
    //     this.classList.add('active');
    // });

    // document.getElementById('home').addEventListener('focus', function(){
    //     let head_offset = document.querySelector("header").offsetTop + this.offsetTop;
        
    //     this.style.offset = `${head_offset}px 0px`;
    // });
    
    // document.querySelector('#about-us').addEventListener('click', function(){
    //     document.getElementById("smash_about").focus({preventScroll: false});
    //     if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
    //     if(!contains(divs.about_div, 'left-anime')) divs.about_div.classList.add('left-anime');
    //     deactivate_nav();
    //     this.classList.add('active');
        
    // });
    
    // document.querySelector('#contact-us').addEventListener('click', function(){
    //     document.getElementById("smash_contact").focus({preventScroll: false});
    //     if(!contains(divs.contact_div, 'left-anime')) divs.contact_div.classList.add('left-anime');
    //     if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
    //     deactivate_nav();
    //     this.classList.add('active');
    // });
    
    document.querySelector('body').addEventListener('click', function(){
        //Hide the generated search list and remove animation on search field on body click
        if(contains(divs.search_field, 'loading-text')) divs.search_field.classList.remove('loading-text');
        if(!contains(divs.search_list, 'hidden')) divs.search_list.classList.add('hidden');
    });

}