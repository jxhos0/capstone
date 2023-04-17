document.addEventListener('DOMContentLoaded', function() {
    // Check user is on services page by searching for services div
    if (document.getElementById('container-services')) {
        console.log('services')
        // Get all list elements 
        document.querySelectorAll('li').forEach(li => {
            // Loop through list elements listening for a click
            li.addEventListener('click', () => {
                // Run the load service function using the list element id
                load_service(li.id)
            })
        })
    } else if (document.getElementById('container-booking')) {
        // load_availability();
        // load_doctor_schedule()
        load_bookings()

        document.querySelectorAll('span').forEach(timeslot => {
            timeslot.addEventListener('click', () =>  {
                var time = timeslot.dataset.timeslot
                var date = timeslot.parentElement.dataset.date
                var doctor = timeslot.closest('.doctor-schedule').dataset.doctor_id
                console.log(`Book at ${time} on ${date} with ${doctor}?`)
                // console.log(timeslot.dataset.timeslot)
                // console.log(timeslot.parentElement.dataset.date)
                // console.log(timeslot.closest('.doctor-schedule').dataset.doctor_id)
            });
        });

        document.querySelectorAll('.load_more_rows').forEach(load => {
            load.addEventListener('click', () => {
                var doctor = load.closest('.doctor-schedule').dataset.doctor_id
                let doctor_schedule = document.querySelector(`[data-doctor_id='${doctor}']`)
                
                doctor_schedule.querySelectorAll('.hidden').forEach(element => {
                    element.classList.remove('hidden')
                })

                load.innerHTML = ''
            })
        })

       
    };
});

function load_service(service_id) {
    // Remove the selected class from the already selected service
    document.querySelector('.selected').classList.remove('selected')

    // Add selected class to the newly selected service
    document.getElementById(`${service_id}`).classList.add('selected')

    // Fetch the description from the Django database
    fetch(`/service/${service_id}`)
    .then(response => response.json())
    .then(service => {
        // Set the service description to that of the selected service
        document.querySelector('.service-description').innerText = service.description
    })
}

function load_doctor_schedule() {
    let date = new Date()
    console.log(date.getDate())
    var schedules = []

    fetch('/doctor/schedule')
    .then(response => response.json())
    .then(response => {
      
        for (i = 1; i <= 5; i++) {
            var doctor_schedule = []
            response.forEach(schedule => {
                if (schedule['doctor'] === i) {
                    doctor_schedule.push(schedule)
                } 
            })
            schedules.push(doctor_schedule)
        }
        // console.log(schedules)
    })
}

function load_bookings() {
    fetch('/bookings')
    .then(response => response.json())
    .then(response => {
        render_bookings(response)
    })
}

function render_bookings(data) {
    // console.log(data)
    let doctor_id = 1

    document.querySelectorAll('.availability').forEach(table => {
        
        let bookings = data['bookings']
        let doctor_booking_data = bookings[doctor_id]
        // console.log(bookings[1])

        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // console.log(new Date(data['start_date']))
        let startDate = new Date(data['start_date']);
        let startDay = startDate.getDay();
        let currentMonth = startDate.getMonth() + 1;
        
        const dates = table.querySelector('.dates')
        const timeslots = table.querySelector('.timeslots')
        let datesHTML = ''
        let timesHTML = ''

        for (i = 0; i < 5; i++) {

            var day = startDay + i < 7 ? startDay + i : startDay + i - 7
            datesHTML += `
            <td>
                ${days[day]}<br>
                ${(startDate.getDate() + i).toString().padStart(2, '0')}/${currentMonth.toString().padStart(2, '0')}
            </td>
            `

            var times = '';

            for (j = 0; j < doctor_booking_data.length; j++) {
                // console.log(doctor_booking_data[j])
                // console.log('')

                if (new Date(doctor_booking_data[j]['date']).getDate() === startDate.getDate() + i) {
                    console.log(doctor_id)
                    console.log(startDate.getDate() + i)
                    console.log(doctor_booking_data[j]['times'])

                    for (k = 0; k < doctor_booking_data[j]['times'].length; k++) {
                        if (k < 6) {
                            times += `<span class="timeslot" data-timeslot="${doctor_booking_data[j]['times'][k]}">${doctor_booking_data[j]['times'][k]}</span>`; 
                        } else {
                            times += `<span class="timeslot hidden" data-timeslot="${doctor_booking_data[j]['times'][k]}">${doctor_booking_data[j]['times'][k]}</span>`; 
                        }
                    }
                } else {
                    continue
                }
            }

            timesHTML += `
            <td data-date="${(startDate.getDate() + i).toString().padStart(2, '0')}-${startDate.getMonth()}-${startDate.getFullYear()}">
                ${times}
            </td>
            `
        }

        dates.innerHTML = datesHTML
        timeslots.innerHTML = timesHTML

        doctor_id++
        // console.log(doctor_id)
        
    })
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

