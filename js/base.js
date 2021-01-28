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
        smash_boxes: document.getElementsByClassName('smash_box'),
        out_of_date: document.querySelector('#out-of-date-msg'),
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

    let show_full = async function (response, country_name_node, smash_next) {
        animate_click();
        //smash_next is the container that will contain the formated response
        let data = JSON.parse(response);    //turn response into an object
        if (typeof(smash_next) === 'undefined'){
            //if smash_next is not defined use #smash_today_box as defualt
            smash_next = document.getElementById('smash_today_box');
            smash_next.innerHTML = '';
        }
        
        if(country_name_node) country_name_node.innerHTML = data.timezone;
        
        let time = new Date(Number(data.current.dt) * 1000); // multiplied by 1000 to converted to seconds
        //Format response and make it ready for display
        smash_next.innerHTML += '<p class="details"><span class="details-main"><span class="details-title">Timezone:</span> ' + data.timezone + '</span>&nbsp<span class="details-main">' + '(' + data.lon + ', ' + data.lat + ')' + '</span><span class="details-time"><span class="details-title">Last Update(date):</span> ' + time.toLocaleDateString() + '<span class="to-left"><span class="details-title">Last Update(time):</span>' + time.toLocaleTimeString() + '</span></span></p>\n';
        smash_next.innerHTML += '<h3 class="details-header">Basic Details</h3>\n'; //&#8451
        smash_next.innerHTML += '<p class="details-basic"><span class="details-title">Temperature:</span> ' + data.current.temp + '°C </p>\n';
        smash_next.innerHTML += '<p class="details-basic"><span class="details-title">Pressure:</span> ' + data.current.pressure + 'hPa</p>\n';
        smash_next.innerHTML += '<p class="details-basic"><span class="details-title">Humidity:</span> ' + data.current.humidity + '&#37 </p>\n';
        smash_next.innerHTML += '<p class="details-basic"><span class="details-title">Cloudiness:</span> ' + data.current.clouds + '&#37</p>\n';
        smash_next.innerHTML += '<p class="last-basic"><span class="details-title">Feels Like:</span> ' + data.current.feels_like + '°C </p>\n';
        smash_next.innerHTML += '<h3 class="details-header">Weather Condition</h3>\n';
        smash_next.innerHTML += '<p class="details-weather"><span class="details-title">Weather: </span> ' + data.current.weather[0].main + ' --- ' + data.current.weather[0].description + ' <img class="details-icon" src="http://openweathermap.org/img/wn/' + data.current.weather[0].icon + '@2x.png" alt="icon"/>'  + '</p>\n';
        /*smash_next.innerHTML += '<p>' + data.current.weather[0].description + '</p>\n';*/
        
    }

    let handle_response = async function(dt, lat , lon){
        //processes data (json response) from retrieve_data function (one call API) and returns a JSON object
        let response = await retrieve_data(dt, lat, lon);
        let json = await response.json();
        try{
            if (!response.ok) {
                const error = {
                    status: response.status,
                    statusText: response.statusText
                }
                return Promise.reject(error);
            }
            return JSON.stringify(json);
        }catch(error){
            throw new Error(error);
        }
    }
    
    let retrieve_data = async function(dt, lat, lon){
        //retrieves data from one call API and returns the response
        /*One call API format
        https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&
        exclude={part}&appid={YOUR API KEY}*/
        let url = '';
        if (dt !== 'def'){        
            url = 'http://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + lat + '&lon=' + lon + '&dt=' + dt + '&units=metric&appid=f16f5069fd7086051ded89bf67c0c6e5';
        }else{     
            url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&appid=f16f5069fd7086051ded89bf67c0c6e5";
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
    
    let date = function get_date(){
        //This function displays the date on the header
        let [month, date, year] = ( new Date(Date.now()) ).toLocaleDateString().split("/");
        let [hour, minute, second] = ( new Date(Date.now()) ).toLocaleTimeString().slice(0,7).split(":");
        let date_info = "<p>" + hour + "hr : " + minute + "min : " + second + "sec</p>";
        date_info += "<p>" + date + "/" + month + "/" + year + "</p>";
        document.getElementById('smash_date').innerHTML = date_info;
    }();
    
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
        Array.from(['today_1', 'today_2', 'today_3', 'today_4', 'today', 'retrieved_time'])
        .forEach(function(value, index, array){
            returned_data[value] = localStorage.getItem(value);
        });
        return returned_data;
    }();
    
    async function load_into_storage(){
        try{
            let dat = '';
            let data = [];    //an array to store retrieved forecast data
            data.push((await handle_response('def', divs.def_lat, divs.def_lon)));
            for(let df=0; df<prev_dt.length; df++){
                dat = prev_dt[df];
                data.push(await handle_response(dat, divs.def_lat, divs.def_lon));
            }
            data.push((new Date()).getTime());    //push timestamp of action
            Array.from(['today', 'today_1', 'today_2', 'today_3', 'today_4', 'retrieved_time'])
           .forEach(function(value, index, array){
               localStorage.setItem(value, data[index]); 
            });
            return true;
        }catch(error) {
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
            show_full(retrieve_from_storage.today, today_name_node)
            .then(function(){
                if(divs.smash_today_box.classList.contains('hidden')) divs.smash_today_box.classList.remove('hidden');
                deanimate_click();
            });
        }else{
            show_full((await handle_response('def', divs.def_lat, divs.def_lon)), today_name_node)
            .then(function(){
                if(divs.smash_today_box.classList.contains('hidden')) divs.smash_today_box.classList.remove('hidden');
                deanimate_click();
            })
            .catch(error => {
                /*Something went wrong in the show_full function, most likely 
                the resource could not be reached due to internet connectivity issue*/
                display_error_in_connection_msg();
                deanimate_click();
            });
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
            
            if(!retrieve_from_storage.retrieved_time){
                /*If retrieved_time doesn't exist in local storage, it means forecast data 
                have not been loaded or it has been cleared so we run the load_into_storage function*/
                animate_click();
                load_into_storage().then(done => {
                    if(done) show_today().catch(deanimate_click()).finally(deanimate_click());
                });
                
            }else{
                //if data exists, the if statement checks if it is up-to-date
                let saved_date = (new Date(Number(retrieve_from_storage.retrieved_time)));
                
                if ((new Date().getHours() - saved_date.getHours()) > 2 || saved_date.getDate() !== (new Date().getDate())){
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
    
    document.getElementById('prev-forecast').addEventListener('click', function(){
        
        load_prev_data()
        .then(deanimate_click())
        .catch(error => {
            /*Something went wrong in the load_prev_data (maybe show_full) function, most likely 
            the resource could not be reached due to internet connectivity issue*/
            display_error_in_connection_msg();
        }).finally(function(){
            deanimate_click();
            deactivate_nav();
            document.querySelector('#prev-forecast').classList.add('active');
        });
    });
    
    let load_prev_data = async function(){
        animate_click();
        //this function is fired when the previous forecast button is pressed. it loads the previous forecast section.
        let prev_name_node = document.querySelector('#country_name_prev');
        if(localStorage){
            let names = ['today_1', 'today_2', 'today_3', 'today_4'];
            for(count in divs.smash_boxes){
                /*This loop will only run four times, because there are only five smash_boxes
                on the page and one is already filled by the show_today function*/
                if(!(divs.smash_boxes[count].innerHTML) && !isNaN(count)){
                    show_full(retrieve_from_storage[names[Number(count)-1]], prev_name_node, divs.smash_boxes[count]);
                } 
            }
        }else{
            let dt = '';
            for(count in divs.smash_boxes){
                //prev_dt is an array that contains timestamps for the last four days from any point in time
                dt = prev_dt[Number(count)-1];
                //This loop will only run four times because of the if condition (same reason as the if block)
                if(!(divs.smash_boxes[count].innerHTML) && !isNaN(count)){
                    show_full((await handle_response(dt, divs.def_lat, divs.def_lon)), prev_name_node, divs.smash_boxes[count]);
                } 
            }
       } 
       if(contains(divs.main_div, 'hidden')) divs.main_div.classList.remove('hidden');
       if(!contains(divs.about_div, 'hidden')) divs.about_div.classList.add('hidden');
       if(!contains(divs.contact_div, 'hidden')) divs.contact_div.classList.add('hidden');
       if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
       if(!contains(divs.smash_today, 'hidden') || contains(divs.main_div, 'hidden')){
           my_toggle('hidden', [divs.smash_prev, divs.smash_today]);
       } 
    }
        
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
    
    let gen_list = function (text, field) {
        if(contains(divs.search_list, 'hidden')) divs.search_list.classList.remove('hidden');
        let value = text.toLowerCase();    //user input converted to lower case
        country_obj.then(result => {
            let keys = result.keys_array;    //array that contains name of country
            let generated_list = '';    //initiator that will contain returned matches of country
            divs.search_list.innerHTML = "<p class='search-item-demo'>--Click to select--</p>";
            for(let x=0; x<keys.length; x++){
                if((keys[x].toLowerCase().search(value)) !== -1){
                    generated_list += "<p class='search-item'>" + keys[x] + "</p>";
                }
            }
            if(generated_list){
                divs.search_list.innerHTML += generated_list;
            }else{
                //if generated list is still an empty string then no match was found
                divs.search_list.innerHTML += "<p class='search-item'>Nothing found</p>";
            }
            
            document.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', async function(){
                    animate_click();
                    let spinner = document.querySelector('#spinner');
                    //if(spinner.classList.contains('hidden')) spinner.classList.remove('hidden');
                    if(!contains(divs.search_list, 'hidden')) divs.search_list.classList.add('hidden');
                    field.value = this.innerHTML;    //Replace text in the search field with the text in the clicked option
                    let look_up = this.innerHTML.replace(' ', '').toLowerCase();
                    handle_response('def', result[look_up][0], result[look_up][1])
                    //result is the array that contains countries and their position (gotten from country_obj(a function that returns an object))
                    .then(res => {
                        //alert(res);
                        let request_data = document.querySelector('#request-info');
                        let request_name_node = document.querySelector('#country_name_request');
                        //alert(request_data);
                        request_data.innerHTML = '';        //Clear previous searches
                        show_full(res, request_name_node, request_data);    //run show_full with the returned response
                        if(!contains(divs.main_div, 'hidden')) divs.main_div.classList.add('hidden');
                        if(!contains(divs.contact_div, 'hidden')) divs.contact_div.classList.add('hidden');
                        if(!contains(divs.about_div, 'hidden')) divs.about_div.classList.add('hidden');
                        if(contains(divs.fill_node, 'hidden')) divs.fill_node.classList.remove('hidden');
                        if(!contains(divs.fill_node, 'anime')) divs.fill_node.classList.add('anime');
                        //if(!spinner.classList.contains('hidden')) spinner.classList.add('hidden');
                        deactivate_nav();
                        deanimate_click();
                    }).catch(err => {
                        display_error_in_connection_msg();
                        deanimate_click();
                    }).finally(function(){
                        deanimate_click();
                        //if(!spinner.classList.contains('hidden')) spinner.classList.add('hidden');
                       
                    });
                    
                });
            });
        });
    }
    
    divs.search_field.addEventListener('keyup', function(){
        if(divs.schedule_check) clearTimeout(divs.schedule_check);
        if(!contains(divs.search_list, 'hidden')) divs.search_list.classList.add('hidden');
        if(this.value){
            divs.schedule_check = setTimeout(gen_list, 1000, this.value, this);
        }
        
    });
    
    document.getElementById('home').addEventListener('click', function(){
        if(contains(divs.main_div, 'hidden')) divs.main_div.classList.remove('hidden');
        if(!contains(divs.about_div, 'hidden')) divs.about_div.classList.add('hidden');
        if(!contains(divs.contact_div, 'hidden')) divs.contact_div.classList.add('hidden');
        if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
                        
        if(!divs.valid){
            if(divs.out_of_date.classList.contains('hidden')) divs.out_of_date.classList.remove('hidden');  
        }
        
        if(divs.smash_today.classList.contains('hidden')){
            my_toggle('hidden', [divs.smash_prev, divs.smash_today]);
            if(!contains(divs.smash_today, 'anime')) divs.smash_today.classList.add('anime');
        }
        deactivate_nav();
        this.classList.add('active');
    });
    
    document.querySelector('#about-us').addEventListener('click', function(){
        if(!contains(divs.main_div, 'hidden')) divs.main_div.classList.add('hidden');
        if(!contains(divs.contact_div, 'hidden')) divs.contact_div.classList.add('hidden');
        if(contains(divs.about_div, 'hidden')) divs.about_div.classList.remove('hidden');
        if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
        if(!contains(divs.about_div, 'anime')) divs.about_div.classList.add('anime');
        deactivate_nav();
        this.classList.add('active');
        
    });
    
    document.querySelector('#contact-us').addEventListener('click', function(){
        if(!contains(divs.main_div, 'hidden')) divs.main_div.classList.add('hidden');
        if(!contains(divs.about_div, 'hidden')) divs.about_div.classList.add('hidden');
        if(contains(divs.contact_div, 'hidden')) divs.contact_div.classList.remove('hidden');
        if(!contains(divs.contact_div, 'anime')) divs.contact_div.classList.add('anime');
        if(!contains(divs.fill_node, 'hidden')) divs.fill_node.classList.add('hidden');
        deactivate_nav();
        this.classList.add('active');
        
    });
    
    document.querySelector('body').addEventListener('click', function(){
        //Hide the generated search list and remove animation on search field on body click
        if(contains(divs.search_field, 'loading-text')) divs.search_field.classList.remove('loading-text');
        if(!contains(divs.search_list, 'hidden')) divs.search_list.classList.add('hidden');
    });

}