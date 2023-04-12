document.addEventListener('DOMContentLoaded', function() {
    // Check user is on services page by searching for services div
    if (document.querySelector('#container').querySelector('.services')) {
        // Get all list elements 
        document.querySelectorAll('li').forEach(li => {
            // Loop through list elements listening for a click
            li.addEventListener('click', () => {
                // Run the load service function using the list element id
                load_service(li.id)
            })
        })
    }
})

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