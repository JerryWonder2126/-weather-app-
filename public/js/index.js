/* eslint-disable prettier/prettier */
/* eslint-disable */

$(() => {
    let LOCATION_GRANTED = false;
    const divs = {
        def_lat: 74, //default longitude, just in case IP data API is unavailable
        def_lon: -31, //default longitude, just in case IP data API is unavailable
        valid: true, //a boolean to tell if forecast data stored in local storage is up to date
        schedule_check: false, //used to control the firing of process_search function
        location: true, //used to check if user allowed access to location, changes to false if user denies access       //an object that contains needed divs(containers)
        smash_prev: $('#smash_prev'),
        smash_today: $('#smash_today'),
        searchResultDiv: $('#smash_request'),
        weatherSlides: $('#smash-slides'),
        nav_items: $('.nav_item'),
        // smash_boxes: $('.smash-box'),
        not_found: $('#not-found'),
        no_connection: $('#no-connection'),
        no_location: $('#no-location'),
        main_div: $('main'),
        about_div: $('#smash_about'),
        contact_div: $('#smash_contact'),
        search_field: $('#search-text'),
    };

    const removeIfExists = (div, klass) => {
        // Removes a class from a jquery object if class exists on object's classlist
        if(div.hasClass(klass)) div.removeClass(klass);
    }

    const addIfNotExists = (div, klass) => {
        // Adds a class to a jquery object if class does not exist on object's classlist
        if(!div.hasClass(klass)) div.addClass(klass);
    }

    const animate_click = function () {
        removeIfExists($('#loader'), 'hidden');
        addIfNotExists($('#loader'), 'visible');
        addIfNotExists($('body'), 'noscroll');
    }

    const deanimate_click = function () {
        addIfNotExists($('#loader'), 'hidden');
        removeIfExists($('#loader'), 'visible');
        removeIfExists($('body'), 'noscroll');
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

    // const show_full = async function (response) {
    //     let data = response;    //turn response into an object
    //     let retrieved_time = localStorage.getItem("retrieved_time");
    //     // Create DOM element for display
    //     smash_next = forecast_html_markup(klass=['carousel-item', 'smash_box', 'my_card']);
    //     smash_next.querySelector("h2").textContent = proc_gmt_days(data.dt*1000);
    //     let time = proc_gmt(Number(retrieved_time));
    //     //Format response and make it ready for display
    //     let key = "";
    //     smash_next.querySelectorAll(".details-basic").forEach(function(value,index,array){
    //         key = value.querySelector(".details-content").getAttribute("data-name");
    //         value.querySelector(".details-content").textContent = data[key];
    //     });
    //     smash_next.querySelector(".details-weather")
    //     .querySelectorAll(".details-content").forEach(function(value, index, array){
    //         key = value.getAttribute("data-name");
    //         value.textContent = data.weather[0][key];
    //     });
    //     let icon_url = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    //     smash_next.querySelector(".details-weather").querySelector("img").setAttribute("src", icon_url);
    //     return smash_next;
    // };

    const getDayNameFromTimestamp = (timestamp) => {
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayIndex = new Date(timestamp).getDay();
        return days[dayIndex];
    }

    const show_full = async function (data) {
        // Create DOM element for display
        let smash_next = forecast_html_markup(klass=['smash-box']);
        //Format response and make it ready for display
        smash_next.querySelector(".weather-day").textContent = getDayNameFromTimestamp(data.dt*1000);
        let icon_url = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        smash_next.querySelector(".details-icon").setAttribute("src", icon_url);
        smash_next.querySelector(".weather-info-text").textContent =  data.weather[0]['description'];
        smash_next.querySelectorAll(".details-info-item > .details-content").forEach(value => {
            let key = value.getAttribute("data-name");
            value.textContent = data[key];
        })
        let carouselItemContainer = $(create_dom_elem('div'));
        carouselItemContainer.addClass('carousel-item');
        carouselItemContainer.append(smash_next);
        return carouselItemContainer;
    };

    let update_slide_indicator = function(count) {
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
                        $('.carousel-item').first().addClass('active');
                        $('ol.carousel-indicators li').first().addClass('active');
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
        hide_not_found_msg(); // Should it be visible beforehand then hide it before connecting to backend
        hide_error_in_connection_msg(); // Should it be visible beforehand then hide it before connecting to backend
        let body, endpoint;
        if (look_up) {
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
            if (look_up) {
                display_not_found_msg();
                hide_search_result_div();
                hide_weather_slides();
                if (!LOCATION_GRANTED) {
                    // This means error in connection message is visible, hide it
                    hide_no_location_msg();
                }
            } else {
                display_error_in_connection_msg();
            }
            
            throw new Error(response.statusText);
        }
        const json = await response.json();
        
        return json;
    };

    const display_error_in_connection_msg = () => removeIfExists(divs.no_connection, 'hidden');

    const hide_error_in_connection_msg = () => addIfNotExists(divs.no_connection, 'hidden');

    const display_no_location_msg = () => removeIfExists(divs.no_location, 'hidden');

    const hide_no_location_msg = () => addIfNotExists(divs.no_location, 'hidden');

    const display_not_found_msg = () => removeIfExists(divs.not_found, 'hidden');

    const hide_not_found_msg = () => addIfNotExists(divs.not_found, 'hidden');

    const hide_weather_slides = () => addIfNotExists(divs.weatherSlides, 'hidden');

    const show_weather_slides = () => removeIfExists(divs.weatherSlides, 'hidden');

    const hide_search_result_div = () => addIfNotExists(divs.searchResultDiv, 'hidden')

    const show_search_result_div = () => removeIfExists(divs.searchResultDiv, 'hidden')

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
            const store = []; //an array to store retrieved forecast data
            const data = await get_forecast_data();
            if (data) {
                store.push(add_unit(data.current));
                localStorage.setItem('retrieved_time', new Date().getTime());
                data.daily.forEach(element => {
                    store.push(add_unit(element));
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
             * Also, if last retrieved time isn't today
             * 
             * And, if last retrieved time exceeds 3hrs, then refresh data in localStorage
             */
            await load_into_storage();
        }

        load_sliders(); // This loads up data from localStorage into sliders
    };

    $(() => {
        // This runs on page load, it fires up the whole process
        animate_click();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                divs.def_lat = position.coords.latitude;
                divs.def_lon = position.coords.longitude;
                await check_data_in_storage();
                show_weather_slides();
                LOCATION_GRANTED = true; // Change access to location status, if successful. Default is false.
                deanimate_click();
            },
            () => {
                display_no_location_msg();
                deanimate_click()
            }
        ); 
        // load_sliders();
        // $('#smash-slides').removeClass('hidden');
        // deanimate_click();
    });

    const runSearch = async function (look_up) {
        const modify_list = {
            'temp': '°C',
            'pressure': 'hPa',
            'humidity': '%',
            'feels_like': '°C',
            'clouds': '%'
        };
        const search_result = await get_forecast_data(look_up);
        const smash_next = forecast_html_markup(klass=['smash-box']);
        document.querySelector('#country_name_request').textContent = look_up;
        //Format response and make it ready for display
        smash_next.querySelector(".weather-day").textContent = getDayNameFromTimestamp(search_result.dt*1000);
        let icon_url = `http://openweathermap.org/img/wn/${search_result.weather[0].icon}@4x.png`;
        smash_next.querySelector(".details-icon").setAttribute("src", icon_url);
        smash_next.querySelector(".weather-info-text").textContent =  search_result.weather[0]['description'];
        smash_next.querySelectorAll(".details-info-item > .details-content").forEach(value => {
            let key = value.getAttribute("data-name");
            if (key === 'clouds') {
                value.textContent = search_result.clouds.all + modify_list[key];
            } else {
                value.textContent = search_result.main[key] + modify_list[key];
            }
        });

        if ($('#smash_request .smash-box').length) {
            const html_content = $(smash_next).html();
            $('#smash_request .smash-box').html(html_content);
        } else {
            $('#smash_request').append(smash_next);
        }
    };
    $('#back_btn, .close-btn').on('click', () => {
        hide_search_result_div();
        hide_not_found_msg();  // Hide not found message, should incase an error occured
        if (!LOCATION_GRANTED) {
            // Location not granted, show no_location error
            hide_no_location_msg();
        } else {
            // If location was granted, then show slides
            show_weather_slides();
        }
    });

    $('#search-form').on('submit', (e) => {
        e.preventDefault();
    });

    const processSearch = async (look_up, field) => {
        try {
            field.disabled = true;
            animate_click();
            closeMenu(); // Should it be opened previously. (Mainly applies to mobiles)
            await runSearch(look_up, field);
            // Display search result or empty div in the case of an error
            hide_weather_slides();
            show_search_result_div();
        } catch (err) {
            console.error(err);
        } finally {
            field.value = '';
            field.disabled = false;

            if (!$('a.nav-forecast').hasClass('active')) {
                // Shift display so that forecast area is in view
                $('a.nav-forecast').trigger('click');
            }

            deanimate_click();
        }
    }

    divs.search_field.on('keyup', function (e) {
        e.preventDefault();
        if (divs.schedule_check) clearTimeout(divs.schedule_check);
        if (this.value) {
            divs.schedule_check = setTimeout(processSearch, 1500, this.value, e.target);
        }
    });

    // FOR TOGGLE FUNCTIONALITY IN ABOUT SECTION
    $('.smash-about-me-section').fadeOut(100); // Hide the extra part by default
    $('.toggler').on('click', ev => {
        const location = $(ev.target).attr('data-location');
        let fadeInElements = location === 'extra-about-text' ? '.smash-about-main-section' : '.smash-about-me-section';
        let fadeOutElements = location === 'extra-about-text' ? '.smash-about-me-section' : '.smash-about-main-section';
        $(fadeInElements).fadeIn(1000);
        $(fadeOutElements).fadeOut(1000);
        offset_section($('#about-section'));
    });

    $('a.contact-link').on('click', ev => {
        // Simply to offset contact section when link is clicked from about section
        const active_link = $(ev.target);
        const target_div = active_link.attr('data-target');
        active_link.addClass('active');
        offset_section($(`#${target_div}`));    // Offset section just so it displays properly
        $('input[type=email]').trigger('focusin'); // Set focus on the email field
    });

    // FOR NAVBAR ACTIVE STATE FUNCTIONALITY
    $('a.nav-link').on('click', ev => {
        $('a.nav-link').removeClass('active');
        const active_link = $(ev.target);
        const target_div = active_link.attr('data-target');
        active_link.addClass('active');
        closeMenu();    // Close the menu after click
        offset_section($(`#${target_div}`));    // Offset section just so it displays properly
    });

    $(() => {
        // Set active class on the right nav-link
        const page_url = location.href;
        if (page_url.includes('contact-section')) {
            $('.nav-contact').addClass('active')
        } else if (page_url.includes('about-section')) {
            $('.nav-about').addClass('active')
        } else {
            $('.nav-forecast').addClass('active')
        }

        // Offset the section, just so it displays properly
        $('a.nav-link').each((index, link, array) => {
            link = $(link);
            if (link.hasClass('active')) {
                link.trigger('click'); // The offset applies on click
                return false;
            }
        });
    });

    const offset_section = (section) => {
        // To make sure no content is hidden behind the header
        const header_height = $('header').outerHeight();
        const position = section.offset().top - header_height;
        $('html,body').animate({ scrollTop: position }, 'slow');
    }

    const closeMenu = () => {
        // closes menu
        if ($('.navbar-collapse').hasClass('show')) {
            $('.navbar-toggler .navbar-toggler-icon').trigger('click');
        }
    }

    // Close menu on body scroll, didn't work with jquery & not working still
    document.addEventListener('click', closeMenu(), true);

    // END OF NAVBAR FUNCTIONALITY

    (function () {
        //A function to automatically update the copyright section of the page
        const copy_div = $('#smash_credits p');
        const present = new Date().getFullYear();
        if (present !== 2020) {
            copy_div.html(`WatchOut &copy 2020-${present.toString()}`);
        }
    })();

    const sendMail = async (email, message) => {
        await emailjs.init('cGlqivYQAmD66SRrd');
        await emailjs.send("service_onnkur3","template_ilc1dwi",{
            email,
            message,
            app_name: "WatchOut App",
        });
    }


    $('form > .alert').fadeOut(); // Fade out form error by default

    $('#contact-form > form').on('submit', ev => {
        ev.preventDefault();
        let form = ev.target;
        $('form > .alert').fadeOut(); // Fade out form error, if it was formerly visible
        if (form.reportValidity()) {
            $('#contact-form > form :input').prop('disabled', true);
            $('#contact-submit').val('Sending...');
            sendMail(form.email.value, form.message.value)
            .then(() => {
                form.reset();
                $('.form-success').fadeIn();
            }, 
            () => {
                $('.form-error').fadeIn();
            }).finally(() => {
                $('#contact-submit').val('Send');
                $('#contact-form > form :input').prop('disabled', false);
            });
        }
    });

});