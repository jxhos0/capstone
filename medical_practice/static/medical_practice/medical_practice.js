document.addEventListener('DOMContentLoaded', function() {
    // SERVICES PAGE
    if (document.getElementById('container-services')) {
        // Get all services 
        document.querySelectorAll('.service').forEach(service => {
            // Loop through list elements listening for a click
            service.querySelector('.service-name').addEventListener('click', () => {
                // Run the load service function using the list element id
                if (service.querySelector('.service-name').classList.contains('selected')) {
                    // Do nothing
                } else {
                    // Remove the selected class from any element with it
                    document.querySelectorAll('.selected').forEach(element => {
                        element.classList.remove('selected');
                    });

                    // Add selected class to the service name and description element of the clicked service
                    service.querySelector('.service-name').classList.add('selected')
                    service.querySelector('.service-description').classList.add('selected')
                };
            });
        });


    // BOOKINGS PAGE
    } else if (document.getElementById('container-booking')) {
        // Load bookings for current week using date today as start date
        var date = new Date().toISOString()
        load_bookings(date);

        // Listen for load more bookings click
        document.querySelectorAll('.load_more_rows').forEach(load => {
            load.addEventListener('click', () => {
                // Get doctor ID and schedule elements
                var doctor = load.closest('.doctor-schedule').dataset.doctor_id;
                let doctor_schedule = document.querySelector(`[data-doctor_id='${doctor}']`);
                
                // Add the scrollable property to the table
                doctor_schedule.querySelector('.timeslots').classList.add('scrollable');

                // Show all hidden timeslots
                doctor_schedule.querySelectorAll('.timeslot.hidden').forEach(element => {
                    element.classList.remove('hidden');
                });
            
                // Hide the 'Show More' button
                load.style.visibility = 'hidden';
            });
        });         

        document.querySelectorAll('.icon').forEach(icon => {
            icon.addEventListener('click', () => {
                // Get the current week start date
                var start_date = new Date(document.querySelectorAll('.timeslots .col')[0].dataset.date);

                // Listen for next or previous date selection
                if (icon.id === 'next') {
                    // Set new week start date
                    var new_week_start_date = new Date(start_date.setDate(start_date.getDate() + 5)).toISOString();
                    // Remove the hidden styling on previous button
                    document.querySelectorAll('#prev').forEach(prev => {
                        prev.classList.remove('hidden');
                    });
                } else {
                    // Start new week start date
                    var new_week_start_date = new Date(start_date.setDate(start_date.getDate() - 5)).toISOString();
                    // Hide the previous button if the new week start date is less than the current date
                    if (new_week_start_date < new Date().toISOString()) {
                        document.querySelectorAll('#prev').forEach(prev => {
                            prev.classList.add('hidden');
                        });
                    };
                };

                // Reload new bookings
                load_bookings(new_week_start_date);
            });
        });


    // ACCOUNTS PAGE
    } else if (document.getElementById('accounts-container')) {
        // Get elements with selector h5 class
        document.querySelectorAll('.selector h5').forEach(list => {
            list.addEventListener('click', () => {
                // If clicked element doesn't have selected class
                if (!list.classList.contains('selected')) {
                    document.querySelector('.selected').classList.remove('selected');
                    list.classList.add('selected');

                    // Check what link was clicked on and show appropriate list of appointments
                    if (list.innerText === 'Upcoming Appointments') {
                        document.querySelector('.upcoming-appointments').style.display = 'block';
                        document.querySelector('.past-appointments').style.display = 'none';
                    } else {
                        document.querySelector('.upcoming-appointments').style.display = 'none';
                        document.querySelector('.past-appointments').style.display = 'block';  
                    };
                };
            });
        });

        // Check if account is a doctor account
        if (!document.querySelector('.schedule-today p')) {
            // Wait for click on an appointment in todays schedule
            document.querySelectorAll('.appointment').forEach(appointment => {
                appointment.addEventListener('click', () => {
                    // Remove "No selected appointment" text from the appointment details div
                    document.querySelector('.no-selected-appointment').style.display = 'none';

                    // If an appointment is already selected remove the selected class
                    if (document.querySelector('.appointment.selected')) {
                        document.querySelector('.appointment.selected').classList.remove('selected');
                    };

                    // Add the selected class to the new appointment
                    appointment.classList.add('selected');

                    // Get the appointment ID
                    var appointment_id = appointment.id;
    
                    // Loop through the appointment details divs
                    document.querySelectorAll('.details').forEach(element => {
                        // Remove selected class (if exists) from details divs
                        if (element.classList.contains('active')) {
                            element.classList.remove('active');
                        };
                        // If the details div has the same appointment ID add active class
                        if (element.id === appointment_id) {
                            element.classList.add('active');
                        };
                    });

                    // Ensure all save buttons say "Save Notes"
                    document.querySelectorAll('.save-doctor-notes').forEach(button => {
                        button.value = 'Save Notes';
                    });
                });
            });

            // Listen for a doctor to submit their appointment notes
            document.querySelectorAll('.save-doctor-notes').forEach(button => {
                button.addEventListener('click', () => {
                    // Post the doctor notes to the database with CSRF token
                    fetch('/save_doctors_notes', {
                        method: 'POST',
                        headers: {'X-CSRFToken': getCookie('csrftoken')},
                        mode: 'same-origin',
                        body: JSON.stringify({
                            appointment_id : button.closest('.details').id,
                            note : button.closest('.doctor-notes').querySelector('#doctor-notes').value
                        })
                    })
                    .then((response) => {
                        // Check for HTTP Response
                        // If success code
                        if (response["status"] === 200) {
                            // Change save button to "Saved"
                            button.value = 'Saved'
                        }; 
                    });
                });
            });
        };
    };
});


// Load bookings for 5 days including the requested date
function load_bookings(dateString) {
    // Retrieve booking page data from database
    fetch(`/bookings/${dateString}`)
    .then(response => response.json())
    .then(response => {
        // Load data into function to render it to the page
        render_bookings(response);
    });
};


// Render the bookings page using the loaded bookings data
function render_bookings(data) {
    // Set doctor ID
    let doctor_id = 1;

    // Create array with days of the week
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get all doctor HTML elements on bookings page
    // Loop over each HTML element
    document.querySelectorAll('.availability').forEach(table => {
        // Set the booking data
        let bookings = data['bookings'];

        // Set the current doctors bookings
        let doctor_booking_data = bookings[doctor_id];
        
        // Get the dates and timeslots table row HTML elements
        const dates = table.querySelector('.dates');
        const timeslots = table.querySelector('.timeslots');

        // Check is timeslot element has previously been expanded
        if (timeslots.classList.contains('scrollable')) {
            // Remove scrollable class
            timeslots.classList.remove('scrollable');

            // Show the 'Show More'button
            table.querySelector('.load_more_rows').style.visibility = 'visible';
        };
  
        // Set initial HTML content for the dates and timeslots table rows
        let datesHTML = '';
        let timesHTML = '';

        // Loop through the next five days
        for (i = 0; i < 5; i++) {
            // Set the days date and days
            var col_date = new Date(data['dates'][i]);
            var col_day = col_date.getDay();
            var month_of_col_date = col_date.getMonth() + 1

            // Create a string for the date and month
            let date_string = (col_date.getDate()).toString().padStart(2, '0');
            let month_string = month_of_col_date.toString().padStart(2, '0');

            const shaded = i === 0 || i % 2 == 0 ? 'shaded' : ''

            // Set the HTML of the dates row showing dates and days
            datesHTML +=    `<div class="col ${shaded}">
                                ${days[col_day]}<br>
                                ${date_string}/${month_string}
                            </div>`;

            // Create empty times variable
            var times = '';

            // Loop through the doctor bookings per day
            for (j = 0; j < doctor_booking_data.length; j++) {
                // Check if doctor booking date is the same as the table column date, else skip.
                if (new Date(doctor_booking_data[j]['date']).getDate() === col_date.getDate()) {
                    // Loop through doctor booking times creating HTML elements for each
                    for (k = 0; k < doctor_booking_data[j]['times'].length; k++) {
                        var time = doctor_booking_data[j]['times'][k];
                        var time_ampm = ampm_time_format(time)

                        // Set first six available timeslots as viewable, and the remaining as hidden
                        if (k < 6) {
                            times += `<button class="timeslot" data-timeslot="${doctor_booking_data[j]['times'][k]}">${time_ampm}</button>`; 
                        } else {
                            times += `<button class="timeslot hidden" data-timeslot="${doctor_booking_data[j]['times'][k]}">${time_ampm}</button>`; 
                        };
                    };
                } else {
                    continue
                };
            };

            // Set the HTML for each days available booking HTML elements for the doctor, assigning date data.
            timesHTML +=    `<div class="col ${shaded}" data-date="${col_date.getFullYear()}-${month_string}-${date_string}">
                                ${times}
                            </div>`;
        };

        // Assign the HTML for the dates and timeslots to the respective page elements
        dates.innerHTML = datesHTML;
        timeslots.innerHTML = timesHTML;

        // Increment doctor ID for next loop
        doctor_id++;
    });

    // Listen for clicks on the availble timeslot elements
    document.querySelectorAll('button.timeslot').forEach(timeslot => {
        timeslot.addEventListener('click', () =>  {
            // Get the time, date and doctor data for the booking clicked on
            var time = timeslot.dataset.timeslot;
            var date = timeslot.parentElement.dataset.date;
            var doctor_id = timeslot.closest('.doctor-schedule').dataset.doctor_id;
            var doctor = document.querySelector(`[data-doctor_id='${doctor_id}']`).querySelector('.doctor-overview h5').innerText;
            var doctor_photo_html = document.querySelector(`[data-doctor_id='${doctor_id}']`).querySelector('.photo-container').innerHTML;

            render_booking_confirmation_dialog(time, date, doctor_id, doctor, doctor_photo_html);
        });
    });
};


// Render the booking confirmation dialog
function render_booking_confirmation_dialog(time, date, doctor_id, doctor, doctor_photo_html) {
    // Set dialog and back arrow HTML elements as variable s
    let dialog = document.querySelector('#booking-modal');
    let back_arrow = dialog.querySelector('.back-dialog');

    // Create a recent elements list and creat a current element with the first HTML element
    var recent_elements = [];
    var current_element = dialog.querySelector('.patient-type');

    // Set blank variables of patient first name, last name and email
    var first_name = '';
    var last_name = '';
    var email = '';

    // Set the values of the dialog header HTML element
    dialog.querySelector('.photo-container').innerHTML = `${doctor_photo_html}`
    dialog.querySelector('.appointment-doctor').innerHTML = `<strong>${doctor}</strong>`;
    dialog.querySelector('.appointment-date-time').innerHTML = `on <strong>${new Date(date).toDateString()}</strong> at <strong>${ampm_time_format(time)}</strong>`;
    
    // Set the values of the confirmation page
    dialog.querySelector('.selected-date').innerText = `${new Date(date).toDateString()}`;
    dialog.querySelector('.selected-time').innerText = `${ampm_time_format(time)}`;
    dialog.querySelector('.selected-doctor').innerText = `${doctor}`;

    // Set the max value for date of birth input field in registration form as anything less than today
    dialog.querySelector('input[name="dob"]').max = new Date().toISOString().split("T")[0];

    // Listen for the dialog box to be closed, reload booking page if dialog is closed.
    dialog.querySelector('.close-dialog').addEventListener('click', () => {
        dialog.close();
        location.reload()
    });

    // Listen for the dialog back arrow to be clicked.
    back_arrow.addEventListener('click', () => {
        // Hide the current element
        current_element.style.display = 'none';

        // Set the last element in the recent element list as the new current element and set display to block
        current_element = recent_elements[recent_elements.length - 1];
        current_element.style.display = 'block';

        // Remove the last element from the recent elements list
        recent_elements.pop(recent_elements.length - 1);

        // If HTML element is the original element, hide the back arrow
        if (recent_elements.length === 0) {
            back_arrow.style.visibility = 'hidden';
        };

        // If going back from the confirmation booking HTML element, show the dialog header again
        if (recent_elements.length === 2) {
            dialog.querySelector('.dialog-appointment-details').style.display = 'grid';
        };
    });

    // Show the dialog box with all intial variables set
    dialog.showModal();

    // Listen to input of patient type (existing patient or new patient)
    dialog.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            // Hide current HTML element and add it to the end of the recents list
            current_element.style.display = 'none';
            recent_elements.push(current_element);

            // Set the new HTML element based on user selection and show respective element
            current_element = dialog.querySelector(`.${button.id}`);
            current_element.style.display = 'block';
            
            // Show back arrow
            back_arrow.style.visibility = 'visible';
        });
    });

    // Listen for submission of login form
    dialog.querySelector('form#login').querySelector('.btn').addEventListener('click', () => {
        // Get values from the form
        first_name = dialog.querySelector('form#login').querySelector('#first_name_login').value;
        last_name = dialog.querySelector('form#login').querySelector('#last_name_login').value

        // Post the data to the server with CSRF Token
        fetch('/confirm-patient', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                first_name  : dialog.querySelector('form#login').querySelector('#first_name_login').value,
                last_name   : dialog.querySelector('form#login').querySelector('#last_name_login').value
            })
        })
        .then((response) => {
            // Check for HTTP Response
            // If success code
            if (response["status"] === 200) {
                // Hide current HTML element and add it to the end of the recents list
                current_element.style.display = 'none';
                recent_elements.push(current_element);
    
                // Set the new current element and set display to block
                current_element = dialog.querySelector('.confirm-booking');
                current_element.style.display = 'block';
    
                // Hide the dialog header
                dialog.querySelector('.dialog-appointment-details').style.display = 'none';
    
            // If user is unauthorised
            } else if (response["status"] === 401) {
                dialog.querySelector('form#login').querySelector('#first_name_login').value = ''
                dialog.querySelector('form#login').querySelector('#last_name_login').value = ''
                dialog.querySelector('form#login').querySelector('#first_name_login').placeholder = 'Error: Please check the name and try again'
                dialog.querySelector('form#login').querySelector('#last_name_login').placeholder = 'Error: Please check the name and try again'
                dialog.querySelector('form#login').querySelector('#first_name_login').style.borderColor = 'red'
                dialog.querySelector('form#login').querySelector('#last_name_login').style.borderColor = 'red'
            };
        });
    });

    // Listen for submission of registration form
    dialog.querySelector('form#dialog-register').querySelector('.btn').addEventListener('click', () => {

        first_name = dialog.querySelector('form#dialog-register').querySelector('#dialog_first_name_register').value;
        last_name = dialog.querySelector('form#dialog-register').querySelector('#dialog_last_name_register').value;
           
        // Post the data to the server with CSRF Token
        fetch('/register', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                first_name      : dialog.querySelector('form#dialog-register').querySelector('#dialog_first_name_register').value,
                last_name       : dialog.querySelector('form#dialog-register').querySelector('#dialog_last_name_register').value,
                dob             : dialog.querySelector('form#dialog-register').querySelector('#dialog_dob').value,
                gender          : dialog.querySelector('form#dialog-register').querySelector('#dialog_gender').value,
                phone_number    : dialog.querySelector('form#dialog-register').querySelector('#dialog_phone_number').value,
                email           : dialog.querySelector('form#dialog-register').querySelector('#dialog_email').value,
                password        : dialog.querySelector('form#dialog-register').querySelector('#dialog_password').value,
                confirmation    : dialog.querySelector('form#dialog-register').querySelector('#dialog_confirmation').value,
            })
        })
        .then((response) => {
            // Check for HTTP Response
            // If success code
            if (response["status"] === 200) {
                // Hide current HTML element and add it to the end of the recents list
                current_element.style.display = 'none';
                recent_elements.push(current_element);
    
                // Set the new current element and set display to block
                current_element = dialog.querySelector('.confirm-booking');
                current_element.style.display = 'block';

                // Hide the dialog header
                dialog.querySelector('.dialog-appointment-details').style.display = 'none';

            // If user is unauthorised
            } else if (response["status"] === 401) {
                // INSERT ERROR MESSAGE authentication

            // If patient already esxists
            } else if (response["status"] === 409) {
                dialog.querySelector('form#dialog-register').querySelector('#dialog_first_name_register').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_last_name_register').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_dob').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_gender').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_phone_number').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_email').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_password').value = ''
                dialog.querySelector('form#dialog-register').querySelector('#dialog_confirmation').value = ''

                dialog.querySelector('form#dialog-register').querySelector('#dialog_email').placeholder = 'An account already exists with this email address.'
                dialog.querySelector('form#dialog-register').querySelector('#dialog_email').style.borderColor = 'red'
            };
        });
    });

    // Listen for confirmation button
    dialog.querySelector('#confirm-booking').addEventListener('click', () => {
        // Post the data to the server with CSRF Token
        fetch('/book_appointment', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                first_name : first_name,
                last_name : last_name,
                doctor_id : doctor_id,
                time : time,
                date : date,
                note : dialog.querySelector('#patient-notes').value
            })
        })
        .then((response) => {
            // Check for HTTP Response
            // If success code
            if (response["status"] === 200) {
                // Hide the dialog back arrow and current HTML element
                back_arrow.style.visibility = 'hidden';
                current_element.style.display = 'none';

                // Show the confirmed booking HTML element
                dialog.querySelector('.confirmed-booking').style.display = 'block'

            // If appointment booking already exists
            } else if (response["status"] === 409) {
                back_arrow.style.visibility = 'hidden';
                dialog.querySelector('.confirmed-booking').innerText = 'This booking is no longer available. Please return to the booking page and choose another timeslot.'
                dialog.querySelector('.confirmed-booking').style.color = 'red'
                dialog.querySelector('.confirmed-booking').style.display = 'block'
            };
        });
    })
};


// Function used to retrieve CSRF token. This code is from Django documentation.
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Function for formatting time
function ampm_time_format(time) {
    // Get hours and minutes as seperate variables
    hours = time.slice(0, 2)
    minutes = time.slice(3, 5)

    // Check if hour is greater than 11
    let ampm_time = hours > 11 ? 
                                (hours == 12 ? hours + ":" + minutes + " PM" : hours - 12 + ":" + minutes + " PM" )     // If hours are greater than 12, subtract 12 and join the hours, minutes and PM tag
                                : hours + ":" + minutes + " AM"                                                         // Join the hours, minutes and AM tag

    // Return the formatted time
    return ampm_time
}
