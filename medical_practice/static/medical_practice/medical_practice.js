document.addEventListener('DOMContentLoaded', function() {

    // console.log(document.activeElement)
    // document.addEventListener('keydown', function(event) {
    //     if (event.key  === 'Tab') {
    //         console.log(document.activeElement)
    //     }
        
    // })

    // Check user is on services page by searching for services div
    if (document.getElementById('container-services')) {
        // Get all services 
        document.querySelectorAll('.service').forEach(service => {
            // Loop through list elements listening for a click
            service.querySelector('.service-name').addEventListener('click', () => {
                // Run the load service function using the list element id
                if (service.querySelector('.service-name').classList.contains('selected')) {
                    console.log('selected')
                } else {
                    document.querySelectorAll('.selected').forEach(element => {
                        element.classList.remove('selected')
                    })

                    service.querySelector('.service-name').classList.add('selected')
                    service.querySelector('.service-description').classList.add('selected')
                }
                // console.log(service.querySelector('.service-name').classList)
            })
        })
    } else if (document.getElementById('container-booking')) {
        // Load bookings for current week using date today as start date
        load_bookings(new Date().toISOString());

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
                })
            
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
    } else if (document.getElementById('appointments-container')) {
        document.querySelectorAll('.selector h5').forEach(list => {
            list.addEventListener('click', () => {
                if (!list.classList.contains('selected')) {
                    document.querySelector('.selected').classList.remove('selected');
                    list.classList.add('selected');

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

        if (!document.querySelector('.schedule-today p')) {
            document.querySelectorAll('.appointment').forEach(appointment => {
                appointment.addEventListener('click', () => {
    
                    document.querySelector('.no-selected-appointment').style.display = 'none';

                    var name = appointment.querySelector('.name').innerText;
    
                    document.querySelectorAll('.details').forEach(element => {
    
                        if (element.classList.contains('active')) {
                            element.classList.remove('active')
                        };
    
                        if (element.querySelector('.patient-name .value p').innerText === name) {
                            element.classList.add('active')
                        };
                    });
                });
            });
        };
    };
});

function load_service(service_id) {
    // Remove the selected class from the already selected service
    document.querySelector('.selected').classList.remove('selected');

    // Add selected class to the newly selected service
    document.getElementById(`${service_id}`).classList.add('selected');

    // Fetch the description from the Django database
    fetch(`/service/${service_id}`)
    .then(response => response.json())
    .then(service => {
        // Set the service description to that of the selected service
        document.querySelector('.service-description').innerText = service.description;
    });
};

function load_bookings(dateString) {
    // Retrieve booking page data from database
    fetch(`/bookings/${dateString}`)
    .then(response => response.json())
    .then(response => {
        // Load data into function to render it to the page
        render_bookings(response);
    });
};

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
            console.log(doctor_photo_html)

            render_booking_confirmation_dialog(time, date, doctor_id, doctor, doctor_photo_html);
        });
    });
};

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
    dialog.querySelector('.appointment-date-time').innerHTML = `on <strong>${new Date(date).toDateString()}</strong> at <strong>${time}</strong>`;
    
    // Set the values of the confirmation page
    dialog.querySelector('.selected-date').innerText = `${new Date(date).toDateString()}`;
    dialog.querySelector('.selected-time').innerText = `${time}`;
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
        fetch('/login', {
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
                // INSERT ERROR MESSAGE authentication
            };
        });
    });

    // Listen for submission of registration form
    dialog.querySelector('form#register').querySelector('.btn').addEventListener('click', () => {

        first_name = dialog.querySelector('form#register').querySelector('#first_name_register').value;
        last_name = dialog.querySelector('form#register').querySelector('#last_name_register').value;
           
        // Post the data to the server with CSRF Token
        fetch('/register', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                first_name      : dialog.querySelector('form#register').querySelector('#first_name_register').value,
                last_name       : dialog.querySelector('form#register').querySelector('#last_name_register').value,
                dob             : dialog.querySelector('form#register').querySelector('#dob').value,
                gender          : dialog.querySelector('form#register').querySelector('#gender').value,
                phone_number    : dialog.querySelector('form#register').querySelector('#phone_number').value,
                email           : dialog.querySelector('form#register').querySelector('#email').value,
                password        : dialog.querySelector('form#register').querySelector('#password').value,
                confirmation    : dialog.querySelector('form#register').querySelector('#confirmation').value,
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
                // INSERT ERROR MESSAGE account exists
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
                // dob : dialog.querySelector('form#register').querySelector('#dob').value,
                // gender : dialog.querySelector('form#register').querySelector('#gender').value,
                doctor_id : doctor_id,
                time : time,
                date : date,
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
                // INSERT ERROR MESSAGE
            };
        });
    })
};

// function login(dialog, current_element, recent_elements) {
//     fetch('/login', {
//         method: 'POST',
//         headers: {'X-CSRFToken': getCookie('csrftoken')},
//         mode: 'same-origin',
//         body: JSON.stringify({
//             first_name: dialog.querySelector('form#login').querySelector('#first_name_login').value,
//             last_name: dialog.querySelector('form#login').querySelector('#last_name_login').value
//         })
//     })
//     .then((response) => {
//         if (response["status"] === 204) {
//             current_element.style.display = 'none';
//             recent_elements.push(current_element);

//             current_element = dialog.querySelector('.confirm-booking');

//             current_element.style.display = 'block';

//             dialog.querySelector('.dialog-appointment-details').style.display = 'none';

//             // console.log(recent_elements.innerHTML)
//         } else if (response["status"] === 401) {
//             // INSERT ERROR MESSAGE
//         };
//     });
// };


// function register_patient(dialog, current_element, recent_elements) {
//     fetch('/register', {
//         method: 'POST',
//         headers: {'X-CSRFToken': getCookie('csrftoken')},
//         mode: 'same-origin',
//         body: JSON.stringify({
//             first_name : dialog.querySelector('form#register').querySelector('#first_name_register').value,
//             last_name : dialog.querySelector('form#register').querySelector('#last_name_register').value,
//             dob : dialog.querySelector('form#register').querySelector('#dob').value,
//             gender : dialog.querySelector('form#register').querySelector('#gender').value,
//             phone_number : dialog.querySelector('form#register').querySelector('#phone_number').value,
//             email : dialog.querySelector('form#register').querySelector('#email').value,
//             password : dialog.querySelector('form#register').querySelector('#password').value,
//             confirmation : dialog.querySelector('form#register').querySelector('#confirmation').value,
//         })
//     })
//     .then((response) => {
//         if (response["status"] === 204) {
//             current_element.style.display = 'none';
//             recent_elements.push(current_element);

//             current_element = dialog.querySelector('.confirm-booking');

//             current_element.style.display = 'block';

//             dialog.querySelector('.appointment-details').style.display = 'none';

//             // console.log(recent_elements.innerHTML)
//         } else if (response["status"] === 401) {
//             // INSERT ERROR MESSAGE
//         } else if (response["status"] === 409) {
//             // INSERT ERROR MESSAGE
//         };
//     });
// };

// function book_appointment(){

// };


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

// function load_availability() {
//     load_doctor_schedule()
//     load_bookings()

//     document.querySelectorAll('.availability').forEach(table => {
        
//         var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//         let dateToday = new Date();
//         let dayToday = dateToday.getDay();
//         let currentMonth = dateToday.getMonth() + 1;
        
//         const dates = table.querySelector('.dates')
//         const timeslots = table.querySelector('.timeslots')
//         let datesHTML = ''
//         let timesHTML = ''

//         for (i = 0; i < 5; i++) {
            
//             var day = dayToday + i < 7 ? dayToday + i : dayToday + i - 7
//             datesHTML += `
//             <td>
//                 ${days[day]}<br>
//                 ${(dateToday.getDate() + i).toString().padStart(2, '0')}/${currentMonth.toString().padStart(2, '0')}
//             </td>
//             `

//             var times = '';
//             for(var j = 8 * 60; j<= 18 * 60; j+= 15){
//                 hours = Math.floor(j/ 60);
//                 if (hours < 10) {
//                     hours = '0' + hours;
//                 }
//                 minutes = j% 60;
//                 if (minutes < 10) {
//                     minutes = '0' + minutes; // adding leading zero
//                 }
                
//                 let ampm_time = hours > 12 ? hours - 12 + ":" + minutes + " PM" : hours + ":" + minutes + " AM"
//                 if (j < 540 + 15 * 5) {
//                     times += `<span class="timeslot" data-timeslot="${hours}${minutes}">${ampm_time}</span>`; 
//                 } else {
//                     times += `<span class="timeslot hidden" data-timeslot="${hours}${minutes}">${ampm_time}</span>`; 
//                 }
                
//             }

//             timesHTML += `
//             <td data-date="${(dateToday.getDate() + i).toString().padStart(2, '0')}-${dateToday.getMonth()}-${dateToday.getFullYear()}">
//                 ${times}
//             </td>
//             `
//         }

//         dates.innerHTML = datesHTML
//         timeslots.innerHTML = timesHTML
        
//     })
// }

