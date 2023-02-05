/* eslint-disable prettier/prettier */
/* eslint-disable */
import { 
    animate_click,
    deanimate_click,
    divs,
    getDayNameFromTimestamp,
    create_dom_elem,
    display_error_in_connection_msg,
    display_not_found_msg,
    show_search_result_div,
    hide_error_in_connection_msg,
    hide_no_location_msg,
    hide_not_found_msg,
    hide_search_result_div,
    hide_weather_slides,
    closeMenu } from "./helpers.js";
/**
 * 
 * @param {CustomObject} data an object containing the data to be displayed 
 * @returns {HTMLElement} an HTML element correctly formatted to display the data
 */
 const show_full = async function (data) {
    // Create DOM element for display
    let smash_next = forecast_html_markup(['smash-box']);
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

/**
 * Adds a slider indicator to the carousel slider in the home page
 * @param {Number} count the position of the slider to work on 
 * @returns {HTMLElement} the new slider indicator created
 */
let update_slide_indicator = function(count) {
    //Simply to update the indicator in the slider
    let node_obj = create_dom_elem('li');
    $(node_obj).attr('data-target', "#smash-slides");
    $(node_obj).attr('data-slide-to', count);
    $('ol.carousel-indicators').append(node_obj);
    return node_obj;
}

/**
 * Loads weather data from localstorage into the carousel on the home page
 */
 let load_sliders = function(){
    if(localStorage){
        const weatherData = retrieve_from_storage();
        weatherData.forEach((elem, index, array) => {
            show_full(elem).then(result => {
                $('.carousel-inner').append(result);
                update_slide_indicator(index);
                if((index + 1) == array.length){
                    // On last iteration, add active class to first carousel-item to make slide active
                    $('.carousel-item').first().addClass('active');
                    $('ol.carousel-indicators li').first().addClass('active');
                }
            });
        });
    }
};

/**
     * Returns an HTMLElement that contains all html elements needed to contain forecast data
     * @param {Array} klass an array of strings containing the classes to be added to the markup 
     * @returns {HTMLElement} HTMLElement that contains all html elements needed to contain forecast data
     */
 let forecast_html_markup = (klass) => {
    //markup is the html markup that will contain the formated response
    let markup = $('.smash_box_template').html();
    // Create a new DOM object for manipulation
    let smash_next = create_dom_elem('div');
    smash_next.innerHTML = $.trim(markup);
    // END of DOM creation
    if(typeof(klass) === 'object'){
        klass.forEach(function(value){
            smash_next.classList.add(value);
        });
    }
    return smash_next;
}

/**
 * processes data (json response) from backend endpoint and returns a JSON object
 * @param {Object} body body to be sent with the request
 * @param {string} endpoint the endpoint to send request to
 * @returns {Object} weather data from the API
 */
const get_forecast_data = async function (body, endpoint) {
    hide_not_found_msg(); // Should it be visible beforehand then hide it before connecting to backend
    hide_error_in_connection_msg(); // Should it be visible beforehand then hide it before connecting to backend
    
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

/**
 * Returns an array that contains forecasts retrieved from local storage
 * @returns {Array} an array of weather data (objects)
 */
 const retrieve_from_storage = function () {
    const store_data = localStorage.getItem('store');
    return store_data ? JSON.parse(store_data) : [];
};

/**
 * Sumply to add units to the data gotten from API
 * Also change the way the data is arranged(applies to forecast)
 * 
 * @param {Object} obj_data a weather data object
 * @returns {Object} obj_data already transformed
 */
const add_unit = function (obj_data) {
    const modify_list = {
        'temp': '°C',
        'pressure': 'hPa',
        'humidity': '%',
        'feels_like': '°C',
        'clouds': '%'
    };
    Object.keys(modify_list).forEach((value_s) => {
        let field = obj_data[value_s];
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

/**
 * Saves the weather data to localstorage
 */
async function load_into_storage() {
    try {
        const store = []; // An array to store retrieved forecast data
        const body = {
            lat: divs.def_lat,
            long: divs.def_lon
        };
        const endpoint = '/api/forecast/';
        const data = await get_forecast_data(body, endpoint);
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

/**
 * Updates weather data if necessary, then loads the sliders (carousel)
 */
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

/**
 * Runs the search
 * @param {string} look_up the location of the place to search for
 */
 const runSearch = async function (look_up) {
    const modify_list = {
        'temp': '°C',
        'pressure': 'hPa',
        'humidity': '%',
        'feels_like': '°C',
        'clouds': '%'
    };
    const body = {
        name: look_up
    };
    const endpoint = '/api/search/';
    const search_result = await get_forecast_data(body, endpoint);
    const smash_next = forecast_html_markup(['smash-box']);
    document.querySelector('#country_name_request').textContent = look_up;
    // Format response and make it ready for display
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

/**
 * Processes the search and displays the result
 * @param {string} look_up the name of the location to search for
 * @param {HTMLInputElement} field the input field element 
 */
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

export {
    check_data_in_storage,
    processSearch
}