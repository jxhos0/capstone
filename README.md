# CS50w Capstone - Final Project
Contained within this repository is my final project submission for CS50w Programming with Python and Javascript. It predominantly focusses on the use of Javascript, Python and HTML, while also utilising CSS and a bit of Bootstrap.

The project itself is a web application for a medical clinic called 'Capstone Health', allowing users to view the team, services and details about Capstone Health. Users are able to create an account, view available 15 minute increment timeslots and book with their preferred doctor.

Patients and doctors are both able to sign into their account, and are provided with a specific view based on if they are a doctor or a patient.

## Distinctiveness and Complexity
While this project uses ideas and concepts from prior course submissions, it is an independent idea by istelf. 

Capstone Health web app is different from the e-commerce or network apps as it is not used for selling or listing products, nor is it used for interacting with other uses in a social manner. It is a strictly professional app used for the organisation and storage of doctor, patient and appointment information in a database. I would not classify this as a simple app as it incorporates the use of Javascript and Python to work together for various requests and data handling, including GET and POST.

The project uses the Users model like a lot of the other course projects, however it instead of using this as a stand alone model; this model builds upon user data dependent on what type of account they have. In doing so the app is able to better store specific data related to each user without bloating the User database. 

Other models intereact with one another to allow a map of doctor availability to be made, and interacted with by current and potential patients. 

## Files
### Front End
#### Templates Folder
The templates folder is where all the HTML files for the app are stored. All pages build upon the layout.html page, and the team.html page also includes the team_div_template.html to clean up the code.

#### Static Folder
The styles.css and medical_practice.js files are both located in this folder.

- styles.css is responsible for styling the website by first focussing on the mobile view before using media queries to modify the styling for tablet and desktop views.
- In order to reduce the numbder of requests, medical_practice.js is responsible for the whole web app. It is used to listen for clicks, render available apppointments for doctors as well as change the dates of the rendered bookings. This file was also used in order to change active, selected or hidden classes to alter CSS styling; in addition to changing HTML display elements dependent on user selections. The medical_practice.js file first checks for specific containers in the DOM Element to know what element event listeners to wait for.

  An impoortant function that the medical_practice.js file is that of POST'ing data to the backend database with CSRF tokens. 

### Back End
#### Models at ./medical_practice/models.py
The models file contains six models that are used throughout the app. These models include:

- Services: Contains the titles and descriptions of each service offered by Capstone Health.
- Users: Contains the information pertaining to each user including a "Is Doctor" boolean.
- Patients: Links patient user accounts with the provided medical information such as if they smoke or drink.
- Doctors: Links doctor user accounts with their professional details such as qualifications.
- Doctor Schedules: Listing the day, start, lunch and end time for each doctor.
- Appointments: Links patients, doctors with a date, time and patient/doctor notes.

#### Views at ./medical_practice/views.py
The views.py file allows users to be created, checked, authenitcated, logged in and logged out. 

It also handles the bulk of the work in regards to booking an appointment. It is responsible for taking the appointments and schedules models to create lists of available booking timeslots for each doctor, as well as checking if the appointment is still availble and confirming the appointment in the system.

#### URLs
The urls.py file is responsible for the directing of requests to the relevant functions for rendering data or pages.

## How to run the application
To run the app the only Python package not included in a standard Python install is Django.

To run the app please follow the below steps:

- Run your virtual environment (if using one)
- pip install -r requirements.txt (if you don't already have Django installed)
- python manage.py runserver

## Additional Information
To use the app without creating an account of your own you can use the below detials for a patient and doctor respectively.

|                   | Doctor   | Patient      |
| ----------------- | :------: | :----------: |
| Email (for login) | sxlee    | john@doe.com |
| Password          | capstone | capstone     |  
| First Name        |     -    | John         |
| Last Name         |     -    | Doe          |


