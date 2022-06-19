/* eslint-disable prettier/prettier */
/* eslint-disable */

$(() => {
    const divs = {
        def_lat: 74, //default longitude, just in case IP data API is unavailable
        def_lon: -31, //default longitude, just in case IP data API is unavailable
        valid: true, //a boolean to tell if forecast data stored in local storage is up to date
        schedule_check: false, //used to control the firing of gen_list function
        location: true, //used to check if user allowed access to location, changes to false if user denies access       //an object that contains needed divs(containers)
        smash_prev: $('#smash_prev'),
        smash_today: $('#smash_today'),
        fill_node: $('#smash_request'),
        nav_items: $('.nav_item'),
        smash_today_box: $('#smash_today_box'),
        smash_boxes: $('.smash_box'),
        not_found: $('#not-found'),
        no_connection: $('#no-connection'),
        no_location: $('#no-location'),
        main_div: $('main'),
        about_div: $('#smash_about'),
        contact_div: $('#smash_contact'),
        search_field: $('#search-text'),
        search_list: $('#search-list'),
    };

    const my_toggle = function (klass, conts) {
        //conts is the class to be toggled on node klass
        conts.forEach((value, index, array) => {
            value.classList.toggle(klass);
        });
    };

    const deactivate_nav = function () {
        //removes the 'active' class from all nav elements(.nav-item)
        // const nav_items = $('.nav_item');
        // for (let count = 0; count < nav_items.length; count++) {
        //     if (contains(nav_items[count], 'active'))
        //         nav_items[count].addClass('active');
        // }
        $('.nav_item').each((index, value) => {
            if (value.hasClass('active')) value.removeClass('active')
        })
    };

    const removeIfExists = (div, klass) => {
        // Removes a class from a jquery object if class exists on object's classlist
        if(div.hasClass(klass)) div.removeClass(klass);
    }

    const addIfNotExists = (div, klass) => {
        // Adds a class to a jquery object if class does not exist on object's classlist
        if(!div.hasClass(klass)) div.addClass(klass);
    }

    const contains = function (div, klass) {
        // Checks if a jquery object's classlist contains class
        return div.hasClass(klass);
    };

    const animate_click = async function () {
        removeIfExists($('#loader'), 'hidden');
        removeIfExists($('.dim'), 'hidden');

    }

    const deanimate_click = function () {
        addIfNotExists($('#loader'), 'hidden');
        addIfNotExists($('.dim'), 'hidden'); 

    }

    const proc_gmt = function (time_stamp) {
        /* processes timestamp and returns in the amount of
            elapsed secs,mins,days,weeks,months or years */
        const secs = Math.abs(Date.now() - time_stamp) / 1000;
        let res = '';
        if (secs >= 60 && secs < 3600) {
            //i.e still less than an hour
            res = parseInt(secs / 60) + ' min(s) ago';
        } else if (secs >= 3600 && secs < 86400) {
            //i.e still less than a day
            res = parseInt(secs / 3600) + ' hr(s) ago';
        } else if (secs >= 86400 && secs < 604800) {
            //i.e still less than a week
            res = parseInt(secs / 86400) + ' day(s) ago';
        } else if (secs >= 604800 && secs < 2419200) {
            //i.e still less than a month
            res = parseInt(secs / 604800) + ' week(s) ago';
        } else if (secs >= 2419200 && secs < 29030400) {
            //i.e still less than a year
            res = parseInt(secs / 2419200) + ' month(s) ago';
        } else if (secs >= 29030400) {
            //i.e more than or equal to a year
            res = parseInt(secs / 29030400) + ' year(s) ago';
        } else {
            //i.e still less than a minute
            res = parseInt(secs) + ' sec(s) ago';
        }
        return res;
    };

    const proc_gmt_days = function (time_stamp) {
        /* processes timestamp and returns the amount of
            days from now */
        const stamp_day = Number(new Date(time_stamp).getDate());
        let day_diff = Math.abs(stamp_day - new Date().getDate());
        const month_diff = Math.abs(
            new Date(time_stamp).getMonth() - new Date().getMonth()
        );
        let res = '';
        if (month_diff > 0) {
            //i.e time_stamp falls into a succeding month
            if (month_diff === 1) {
                // time_stamp falls into the next month
                console.log('here');
                if (stamp_day === 1) {
                    //i.e next day is the first day of the next month
                    res = 'tomorrow';
                } else {
                    day_diff = parseInt(Math.abs(Date.now() - time_stamp) / 86400) + 1;
                    res = `${day_diff} days from now`;
                }
            } else {
                //i.e time_stamp falls farther than a month
                day_diff = parseInt(Math.abs(Date.now() - time_stamp) / 86400);
                res = `${day_diff} days from now`;
            }
        } else if (day_diff === 0) {
            res = 'today';
        } else if (day_diff === 1) {
            res = 'tomorrow';
        } else {
            res = `${day_diff} days from now`;
        }
        return res;
    };

    const show_full = async function (response) {
        let data = response;    //turn response into an object
        let retrieved_time = localStorage.getItem("retrieved_time");
        // Create DOM element for display
        smash_next = forecast_html_markup(klass=['carousel-item', 'smash_box', 'my_card']);
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
            const weatherData = retrieve_from_storage();
            weatherData.forEach((elem, index, array) => {
                show_full(elem).then(result => {
                    $('.carousel-inner').append(result);
                    update_slide_indicator(index);
                    if((index + 1) == array.length){
                        //Add active class to first carousel-item to make slide active
                        $($('.carousel-item')[0]).addClass('active');
                        $($('ol.carousel-indicators li')[0]).addClass('active');
                    }
                });
            });
        }
    };

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

    const get_forecast_data = async function (look_up='') {
        //processes data (json response) from backend endpoint and returns a JSON object
        hide_error_in_connection_msg(); // Should it be visible beforehand then hide it before connecting to backend
        let body, endpoint;
        if (url) {
            body = {
                name: look_up
            };
            endpoint = '/api/search/';
        } else {
            body = {
                lat: divs.def_lat,
                long: divs.def_lon
            };
            endpoint = '/api/forecast/';
        }
        
        const response = await fetch(endpoint, {
            body: JSON.stringify(body),
            method: 'POST',
            'headers': {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            display_error_in_connection_msg();
            throw new Error("Couldn't get response from backend");
        }
        const json = await response.json();
        
        return json;
    };

    // const retrieve_data = async function (url, lat, lon) {
    //     //retrieves data from one call API and returns the response
    //     /*One call API format
    //         https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&
    //         exclude={part}&appid={YOUR API KEY}*/
    //     if (!url) {
    //         url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=f16f5069fd7086051ded89bf67c0c6e5`;
    //     }
    //     const the_response = await fetch('/api/data');
    //     return the_response;
    // };

    const display_error_in_connection_msg = () => removeIfExists(divs.no_connection, 'hidden');

    const display_no_location_msg = () => removeIfExists(divs.no_location, 'hidden');

    const hide_error_in_connection_msg = () => addIfNotExists(divs.no_connection, 'hidden');

    const display_not_found_msg = () => removeIfExists(divs.no_connection, 'hidden');

    const hide_not_found_msg = () => addIfNotExists(divs.not_found, 'hidden');

    const date_div = () => {
        //This function displays the date on the header
        const [month, date, year] = new Date(Date.now())
            .toLocaleDateString()
            .split('/');
        const [hour, minute, second] = new Date(Date.now())
            .toLocaleTimeString()
            .slice(0, 7)
            .split(':');
        let date_info =
            '<p>' + hour + 'hr : ' + minute + 'min : ' + second + 'sec<br/>';
        date_info += date + '/' + month + '/' + year + '</p>';
        $('.date-text').html(date_info);
    };
    setInterval(date_div, 1000);

    const update_copyright = (function () {
        //A function to automatically update the copyright section of the page
        const copy_div = $('#copy-rite');
        const present = new Date().getFullYear();
        if (present !== 2020) {
            copy_div.innerHTML = 'WatchOut &copy 2020-' + present.toString();
        }
    })();

    const prev_dt = (function () {
        //generates an object that contains timestamps for the last four days
        data = new Array();
        for (let x = 1; x < 5; x++) {
            prev = new Date(new Date().getTime() - x * 24 * 3600 * 1000).getTime();
            prev = Math.floor(prev / 1000);
            data.push(prev);
        }
        return data;
    })();

    const retrieve_from_storage = function () {
        //returns an object that contains forecasts retrieved from local storage
        const store_data = localStorage.getItem('store');
        return store_data ? JSON.parse(store_data) : [];
    };

    const add_unit = function (obj_data) {
        /* Sumply to add units to the data gotten from API and also change the way the data is arranged(applies to forecast) */
        const modify_list = {
            'temp': '°C',
            'pressure': 'hPa',
            'humidity': '%',
            'feels_like': '°C',
            'clouds': '%'
        };
        Object.keys(modify_list).forEach((value_s) => {
            field = obj_data[value_s];
            if (typeof field === typeof {}) {
                if (value_s === 'temp') {
                    field = field.max;
                } else if (value_s === 'feels_like') {
                    field = field.day;
                }
            }
            obj_data[value_s] = `${field}${modify_list[value_s]}`;
        });
        return obj_data;
    };

    async function load_into_storage() {
        try {
            const dat = '';
            const store = []; //an array to store retrieved forecast data
            const data = await get_forecast_data();
            if (data) {
                store.push(add_unit(data.current))
                // data.push(new Date().getTime()); //push timestamp of action
                // localStorage.setItem('today', JSON.stringify(add_unit(data[0].current)));
                localStorage.setItem('retrieved_time', new Date().getTime());
                data.daily.forEach(element => {
                    store.push(add_unit(element))
                });
                localStorage.setItem('store', JSON.stringify(store));
            }
            
        } catch (error) {
            // The resource could not be reached
            console.log(error);
        }
    }

    const check_data_in_storage = async function () {
        const retrieved_time = localStorage.getItem('retrieved_time');
        const saved_date = new Date(Number(retrieved_time));

        const retrieved_today = saved_date.getDate() === new Date().getDate(); // true if last retrieved date was today
        const retrieved_less_3hrs = new Date().getHours() - saved_date.getHours() < 3; // true if last retrieved time was within the last three hours

        if (!retrieved_time || !retrieved_today || !retrieved_less_3hrs) {
            /**
             * If retrieved_time doesn't exist in local storage, it means forecast data
             * have not been loaded or it has been cleared so we run the load_into_storage function
             * 
             * Also, if last retrieved time isn,t today
             * 
             * And, if last retrieved time exceeds 3hrs
             */
            load_into_storage().then(done => {
                if (done) load_sliders();
            });

        } else {
            load_sliders();
        }
    };

    const page_load = (async function () {
        animate_click();
        // navigator.geolocation.getCurrentPosition(
        //     (position) => {
        //         divs.def_lat = position.coords.latitude;
        //         divs.def_lon = position.coords.longitude;
        //         check_data_in_storage();
        //     },
        //     () => {
        //         display_no_location_msg();
        //     }
        // );
        
        setTimeout(() => {
            check_data_in_storage().finally(deanimate_click());
        }, 6000);  
    })().finally();

    const process_search = async function (look_up, field) {
        if (divs.search_field.classList.contains('loading-text'))
            divs.search_field.classList.remove('loading-text');
        field.disabled = true;
        const modify_list = {
            'temp': '°C',
            'pressure': 'hPa',
            'humidity': '%',
            'feels_like': '°C',
            'clouds': '%'
        };
        const search_result = await get_forecast_data(look_up);
        const smash_next = document.querySelector('#smash_today_box');
        document.querySelector('#country_name_request').textContent = look_up;
        //Format response and make it ready for display
        let key = '';
        smash_next
            .querySelectorAll('.details-basic')
            .forEach((value, index, array) => {
                key = value
                    .querySelector('.details-content')
                    .getAttribute('data-name');
                if (key === 'clouds') {
                    value.querySelector('.details-content').textContent =
                        search_result.clouds.all + modify_list[key];
                } else {
                    value.querySelector('.details-content').textContent =
                        search_result.main[key] + modify_list[key];
                }
            });
        smash_next
            .querySelector('.details-weather')
            .querySelectorAll('.details-content')
            .forEach((value, index, array) => {
                key = value.getAttribute('data-name');
                value.textContent = search_result.weather[0][key];
            });
        const icon_url = `http://openweathermap.org/img/wn/${search_result.weather[0].icon}@2x.png`;
        smash_next
            .querySelector('.details-weather')
            .querySelector('img')
            .setAttribute('src', icon_url);
            // .catch(err => {
            //     console.log(err);
            // })
            // .finally(() => {
            //     field.value = '';
            //     field.disabled = false;

            // });
    };
    $('#back_btn').on('click', () => {
        const smash_box = $('#smash_today_box');
        const active = smash_box.getAttribute('data-active');
        const weatherData = retrieve_from_storage();
        show_full(weatherData[active]).then(() => {
            deanimate_click();
        });
        myMove(smash_box, 50, 'previous'); //animate the display
        document.querySelectorAll('.for_search').forEach((value) => {
            if (contains(value, 'hidden')) {
                value.classList.remove('hidden');
            } else {
                value.classList.add('hidden');
            }
        });
        hide_not_found_msg();
    });

    $('#search-form').on('submit', (e) => {
        e.preventDefault();
    });

    divs.search_field.on('keyup', function (e) {
        e.preventDefault();
        addIfNotExists(divs.search_field, 'loading-text');
        if (divs.schedule_check) clearTimeout(divs.schedule_check);
        if (this.value) {
            divs.schedule_check = setTimeout(() => {
                animate_click();
                process_search().catch(err => console.log(err)).finally(() => {
                    this.value = '';
                    this.disabled = false;
                    deanimate_click();
                });
            }, 1500, this.value, this);
        }
    });

    $('body').on('click', () => {
        //Hide the generated search list and remove animation on search field on body click
        removeIfExists(divs.search_field, 'loading-text');
        addIfNotExists(divs.search_list, 'hidden');
    });

    // FOR TOGGLE FUNCTIONALITY IN ABOUT SECTION
    $('.extra-about-text').toggle(); // Hide the extra part by default
    $('.toggler').on('click', ev => {
        $('.main-about-text, .extra-about-text').toggle('slow');
    });

    // FOR NAVBAR ACTIVE STATE FUNCTIONALITY
    $('a.nav-link').on('click', ev => {
        $('a.nav-link').removeClass('active');
        $(ev.target).addClass('active');
    });

    $(() => {
        const page_url = location.href;
        if (page_url.includes('contact-section')) {
            $('.nav-contact').addClass('active')
        } else if (page_url.includes('about-section')) {
            $('.nav-about').addClass('active')
        } else {
            $('.nav-forecast').addClass('active')
        }
    });

    // END OF NAVBAR FUNCTIONALITY

});