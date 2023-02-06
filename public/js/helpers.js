/* eslint-disable prettier/prettier */
/* eslint-disable */

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
    not_found: $('#not-found'),
    no_connection: $('#no-connection'),
    no_location: $('#no-location'),
    main_div: $('main'),
    about_div: $('#about-section'),
    contact_div: $('#contact-section'),
    search_field: $('#search-text'),
};

/**
 * Removes a class from a jquery object if class exists on object's classlist
 * @function
 * @param {JQueryObject} div the object that is checked
 * @param {string} klass the class to be removed 
 */
const removeIfExists = (div, klass) => {
    if(div.hasClass(klass)) div.removeClass(klass);
}

/**
 * Adds a class to a jquery object if class does not exist on object's classlist
 * @function
 * @param {JQueryObject} div the object that is checked
 * @param {string} klass the class to be added 
 */
const addIfNotExists = (div, klass) => {
    if(!div.hasClass(klass)) div.addClass(klass);
}

/**
 * Makes the loader animation visible
 * @function
 */
const animate_click = function () {
    removeIfExists($('#loader'), 'hidden');
    addIfNotExists($('#loader'), 'visible');
    addIfNotExists($('body'), 'noscroll');
}

/**
 * Hides the loader animation
 * @function
 */
const deanimate_click = function () {
    addIfNotExists($('#loader'), 'hidden');
    removeIfExists($('#loader'), 'visible');
    removeIfExists($('body'), 'noscroll');
}

/**
 * Gets the day of the week based on timestamp
 * @function
 * @param {timestamp} timestamp a timestamp gotten from Date.now() or other alternative
 * @returns {string} the day of the week the timestamp falls into
 */
const getDayNameFromTimestamp = (timestamp) => {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let dayIndex = new Date(timestamp).getDay();
    return days[dayIndex];
}

/**
 * 
 * @param {string} tag the HTMLElement to be created e.g. li, p, b, e.t.c 
 * @returns {HTMLElement} the element created
 */
const create_dom_elem = function(tag){
    var new_dom_obj = document.createElement(tag);
    return new_dom_obj;
}

/**
 * Displays the error in connection message
 * @returns {void}
 */
const display_error_in_connection_msg = () => removeIfExists(divs.no_connection, 'hidden');

/**
  * Hide the error in connection message
  * @returns {void}
  */
const hide_error_in_connection_msg = () => addIfNotExists(divs.no_connection, 'hidden');

/**
  * Displays the no location message
  * @returns {void}
  */
const display_no_location_msg = () => removeIfExists(divs.no_location, 'hidden');

/**
  * Hides the no location message
  * @returns {void}
  */
const hide_no_location_msg = () => addIfNotExists(divs.no_location, 'hidden');

/**
  * Displays the not found message
  * @returns {void}
  */
const display_not_found_msg = () => removeIfExists(divs.not_found, 'hidden');

/**
  * Hides the not found message
  * @returns {void}
  */
const hide_not_found_msg = () => addIfNotExists(divs.not_found, 'hidden');

/**
  * Hides all slides showing weather data for user's current location
  * @returns {void}
  */
const hide_weather_slides = () => addIfNotExists(divs.weatherSlides, 'hidden');

/**
  * Shows all slides showing weather data for user's current location
  * @returns {void}
  */
const show_weather_slides = () => removeIfExists(divs.weatherSlides, 'hidden');

/**
  * Hides slide showing weather data for location searched by user
  * @returns {void}
  */
const hide_search_result_div = () => addIfNotExists(divs.searchResultDiv, 'hidden')

/**
  * Shows slide showing weather data for location searched by user
  * @returns {void}
  */
const show_search_result_div = () => removeIfExists(divs.searchResultDiv, 'hidden')

/**
 * Brings "section" into view
 * @param {JqueryElement} section the element to be set in view
 */
const offset_section = (section) => {
    const header_height = $('header').outerHeight();
    const position = section.offset().top - header_height;
    $('html, body').animate({ scrollTop: position }, 'slow');
}

/**
 * Closes the menu
 */
const closeMenu = () => {
    if ($('.navbar-collapse').hasClass('show')) {
        $('.navbar-toggler .navbar-toggler-icon').trigger('click');
    }
}

export {
    // removeIfExists,
    // addIfNotExists,
    animate_click,
    deanimate_click,
    divs,
    getDayNameFromTimestamp,
    create_dom_elem,
    display_error_in_connection_msg,
    display_no_location_msg,
    display_not_found_msg,
    show_search_result_div,
    show_weather_slides,
    hide_error_in_connection_msg,
    hide_no_location_msg,
    hide_not_found_msg,
    hide_search_result_div,
    hide_weather_slides,
    offset_section,
    closeMenu
};