import { 
    animate_click,
    deanimate_click,
    divs,
    display_no_location_msg,
    show_weather_slides,
    hide_no_location_msg,
    hide_not_found_msg,
    hide_search_result_div,
    offset_section,
    closeMenu } from "./helpers.js";

import {
    check_data_in_storage,
    processSearch
} from './carousel.js';

$(() => {
    let LOCATION_GRANTED = false;

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

    /* HANDLE FORM SUBMISSION */
    /**
     * Sends a mail using EmailJs
     * @param {string} email the email of the user
     * @param {string} message the message of the user
     */
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
                offset_section(divs.contact_div);
            });
        }
    });

    /* END OF HANDLE FORM SUBMISSION */

});