document.addEventListener('DOMContentLoaded', function() {
    // Check user is on services page by searching for services div
    if (document.getElementById('container-services')) {
        // Get all list elements 
        document.querySelectorAll('li').forEach(li => {
            // Loop through list elements listening for a click
            li.addEventListener('click', () => {
                // Run the load service function using the list element id
                load_service(li.id);
            })
        })
    } else if (document.getElementById('container-booking')) {

        load_bookings(new Date().toISOString());

        document.querySelectorAll('.load_more_rows').forEach(load => {
            load.addEventListener('click', () => {
                var doctor = load.closest('.doctor-schedule').dataset.doctor_id;
                let doctor_schedule = document.querySelector(`[data-doctor_id='${doctor}']`);
                
                doctor_schedule.querySelector('.timeslots').classList.add('scrollable')

                doctor_schedule.querySelectorAll('.timeslot.hidden').forEach(element => {
                    element.classList.remove('hidden');
                })
                

                load.style.display = 'none';
            });
        }); 

        // document.querySelectorAll('.icon').addEventListener('click', () => {
        //     var doctor = document.querySelectorAll('.icon').closest('.doctor-schedule').dataset.doctor_id;
        //     var start_date = new Date(document.querySelectorAll('.timeslots td')[0].dataset.date);
        //     console.log(start_date)
        //     console.log(`clicked on ${doctor} table`)

        //     if (document.querySelectorAll('.icon').id === 'next') {
        //         document.querySelectorAll('#prev').forEach(prev => {
        //             prev.classList.remove('hidden')
        //             console.log(`load bookings starting ${new Date(start_date.setDate(start_date.getDate() + 5))}`)
        //         });
        //     } else {
        //         console.log('prev')
        //     }
        // });
        

        document.querySelectorAll('.icon').forEach(icon => {
            icon.addEventListener('click', () => {
                var doctor = icon.closest('.doctor-schedule').dataset.doctor_id;
                var start_date = new Date(document.querySelectorAll('.timeslots .col')[0].dataset.date);
                // console.log(start_date)
                // console.log(`clicked on ${doctor} table`)

                if (icon.id === 'next') {
                    document.querySelectorAll('#prev').forEach(prev => {
                        prev.classList.remove('hidden');
                    });
                    var new_week_start_date = new Date(start_date.setDate(start_date.getDate() + 5)).toISOString()
                    
                    // console.log(`load bookings starting ${new Date(start_date.setDate(start_date.getDate() + 6)).toISOString()}`)
                } else {
                    // console.log('prev')
                    var new_week_start_date = new Date(start_date.setDate(start_date.getDate() - 5)).toISOString()

                    if (new_week_start_date < new Date().toISOString()) {
                        document.querySelectorAll('#prev').forEach(prev => {
                            prev.classList.add('hidden');
                        });
                    };
                    // console.log(`load bookings starting ${new Date(start_date.setDate(start_date.getDate() - 4)).toISOString()}`)
                }
                load_bookings(new_week_start_date)
            });
        });
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

// function load_doctor_schedule() {
//     let date = new Date()
//     console.log(date.getDate())
//     var schedules = []

//     fetch('/doctor/schedule')
//     .then(response => response.json())
//     .then(response => {
      
//         for (i = 1; i <= 5; i++) {
//             var doctor_schedule = []
//             response.forEach(schedule => {
//                 if (schedule['doctor'] === i) {
//                     doctor_schedule.push(schedule)
//                 } 
//             })
//             schedules.push(doctor_schedule)
//         }
//         // console.log(schedules)
//     })
// }

function load_bookings(dateString) {
    // Retrieve booking page data from database
    fetch(`/bookings/${dateString}`)
    .then(response => response.json())
    .then(response => {
        // Load data into function to render it to the page
        render_bookings(response);
        // console.log(resp÷onse)
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

        // Set initial HTML content for the dates and timeslots table rows
        let datesHTML = '';
        let timesHTML = '';

        // Loop through the next five days
        for (i = 0; i < 5; i++) {
            // Set the five dates and days visible on the page
            var col_date = new Date(data['dates'][i]);
            var col_day = col_date.getDay();
            var month_of_col_date = col_date.getMonth() + 1

            let date_string = (col_date.getDate()).toString().padStart(2, '0');
            let month_string = month_of_col_date.toString().padStart(2, '0');

            // Set the HTML of the dates row showing dates and days
            datesHTML += `
            <div class="col">
                ${days[col_day]}<br>
                ${date_string}/${month_string}
            </div>
            `;

            // Create empty times variable
            var times = '';

            // Loop through the doctor bookings per day
            for (j = 0; j < doctor_booking_data.length; j++) {
                // Check if doctor booking date is the same as the table column date, else skip.
                if (new Date(doctor_booking_data[j]['date']).getDate() === col_date.getDate()) {
                    // Loop through doctor booking times creating HTML elements for each
                    for (k = 0; k < doctor_booking_data[j]['times'].length; k++) {
                        // Set first six available timeslots as viewable, and the remaining as hidden
                        if (k < 6) {
                            times += `<span class="timeslot" data-timeslot="${doctor_booking_data[j]['times'][k]}">${doctor_booking_data[j]['times'][k]}</span>`; 
                        } else {
                            times += `<span class="timeslot hidden" data-timeslot="${doctor_booking_data[j]['times'][k]}">${doctor_booking_data[j]['times'][k]}</span>`; 
                        }
                    }
                } else {
                    continue
                };
            };

            // Set the HTML for each days available booking HTML elements for the doctor, assigning date data.
            timesHTML += `
            <div class="col" data-date="${col_date.getFullYear()}-${month_string}-${date_string}">
                ${times}
            </div>
            `;
        };

        // Assign the HTML for the dates and timeslots to the respective page elements
        dates.innerHTML = datesHTML;
        timeslots.innerHTML = timesHTML;

        // Increment doctor ID for next loop
        doctor_id++;
    });

    // Listen for clicks on the availble timeslot elements
    document.querySelectorAll('span').forEach(timeslot => {
        timeslot.addEventListener('click', () =>  {
            // Get the time, date and doctor data for the booking clicked on
            var time = timeslot.dataset.timeslot;
            var date = timeslot.parentElement.dataset.date;
            var doctor = timeslot.closest('.doctor-schedule').dataset.doctor_id;
            console.log(`Book at ${time} on ${date} with ${doctor}?`);
            // console.log(timeslot.dataset.timeslot)
            // console.log(timeslot.parentElement.dataset.date)
            // console.log(timeslot.closest('.doctor-schedule').dataset.doctor_id)
        });
    });
};

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

