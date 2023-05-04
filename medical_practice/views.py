import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.urls import reverse

from django.http import JsonResponse

from datetime import date, time, timedelta, datetime

import math


from .models import *
def confirm_patient(request):
    # Check if data posted to server
    if request.method == "POST":
        # Load data
        data = json.loads(request.body)

        # Set the first and last name
        first_name = data['first_name']
        last_name = data['last_name']

        try:
            # If the user exists (case insensitive search)
            User.objects.get(first_name__iexact=first_name, last_name__iexact=last_name)
            return HttpResponse(status=200)
        
        except User.DoesNotExist:
            return HttpResponse(status=401)

def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]

        # Authenticate the user
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse(f"account"))
        
        else:
            return render(request, "medical_practice/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "medical_practice/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
    
def register(request):
    if request.method == "POST":
        # Check if form submission
        if request.POST:
            first_name      = request.POST["first_name"]
            last_name       = request.POST["last_name"]
            dob             = request.POST['dob']
            gender          = request.POST['gender']
            phone           = request.POST['phone_number']
            email           = request.POST["email"]
            password        = request.POST["password"]
            confirmation    = request.POST["confirmation"]

            if password != confirmation:
                return render(request, "network/register.html", {
                    "message": "Passwords must match."
                })

            # Attempt to create new user
            try:
                user = User.objects.create_user(first_name=first_name, 
                                            last_name=last_name, 
                                            dob=dob,
                                            gender=gender,
                                            phone=phone,
                                            email=email, 
                                            username=email, 
                                            password=password,
                                            )
                user.save()
            
            except IntegrityError:
                return render(request, "network/register.html", {
                    "message": "An account already exists with that email."
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        
        # Else if fetch POST
        else:
            data = json.loads(request.body)

            first_name      = data["first_name"]
            last_name       = data["last_name"]
            dob             = data['dob']
            gender          = data['gender']
            phone           = data['phone_number']
            email           = data["email"]
            password        = data["password"]
            confirmation    = data["confirmation"]

            # Ensure password matches confirmation
            if password != confirmation:
                return JsonResponse({"message": "Passwords must match!"}, status=401)

            # Attempt to create new patient account
            try:
                user = User.objects.create_user(first_name=first_name, 
                                            last_name=last_name, 
                                            dob=dob,
                                            gender=gender,
                                            phone=phone,
                                            email=email, 
                                            username=email, 
                                            password=password,
                                            )
                user.save()
            
            except IntegrityError:
                return JsonResponse({"message": "An account already exists with that email."}, status=409)
            
            Patient.objects.create(user=user)
            login(request, user)
            return HttpResponse(status=200)

    else:
        return render(request, "medical_practice/register.html")

def index(request):
    return render(request, "medical_practice/index.html")

def services(request):
    services = Service.objects.all()

    return render(request, "medical_practice/services.html", {
        "services" : services
    })

def team(request):
    # Get the list of doctors
    doctors = Doctor.objects.all()

    return render(request, "medical_practice/team.html", {
        'doctors' : doctors
    })

def practiceInformation(request):
    return render(request, "medical_practice/practice.html")

def contact(request):
    return render(request, "medical_practice/contact.html")

def book(request):
    doctors = Doctor.objects.all()
    return render(request, "medical_practice/book.html", {
        "doctors" : doctors
    })
    
def load_doctor_schedule(request):
    schedules = DoctorSchedule.objects.all()

    return JsonResponse([schedule.serialize() for schedule in schedules], safe=False)

def load_booking_timeslots(request, date_string):

    # Set the date and day based on requested date string
    inputDate = datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S.%f%z').date()
    inputDay = inputDate.weekday() + 1  if inputDate.weekday() + 1 < 7 else inputDate.weekday() + 1 - 7 # Add one to keep with js assignment of day integers

    # Load the doctor objects and their respective schedules
    doctors = Doctor.objects.all()
    schedules = DoctorSchedule.objects.all()

    # Check if the requested date string is the same as the date today
    if str(inputDate) == timezone.now().strftime("%Y-%m-%d"):
        # If today is the requested date, set the time rounded to nearest 15 minute and load apppintments for the doctors after the rouinded time.
        time_now = round_time_nearest_quarter(timezone.now().strftime("%H:%M"))
        appointments = Appointment.objects.filter(date__gte=timezone.now(), date__lte=timezone.now() + timedelta(days = 4), time__gte=time(int(time_now[:2]), int(time_now[3:]), 0))
    else:
        # Load all appointment between the selected dates
        appointments = Appointment.objects.filter(date__gte=timezone.now(), date__lte=timezone.now() + timedelta(days = 4))

    # Create empty dictionary of bookings
    bookings = {}

    # Create empty list of dates and populate with the input date and the following 4 dates
    dates = []
    for i in range(5):
        dates.append(inputDate + timedelta(days=i))

    # Loop through the doctors
    for doctor in doctors:
        # Get the doctor schedule and create an empyt list of bookings
        doctor_schedule = schedules.filter(doctor=doctor)
        doctor_bookings = []
        
        # Loop five times for the five days of data
        for i in range(0, 5):
            # Set the date and day
            selectedDate = inputDate + timedelta(days=i)
            selectedDay = inputDay + i if inputDay + i < 7 else inputDay + i - 7

            # Load the daily schedule and appointments of the current doctor 
            daily_schedules = doctor_schedule.filter(day=selectedDay)
            dailyAppointments = appointments.filter(doctor=doctor, date=selectedDate)
                      
            # Loop through each days schedule of the doctor
            for schedule in daily_schedules:
                # Create empty timeslots list
                timeslots = []
                
                # Check if the requested date string is the same as the date today
                if str(selectedDate) == timezone.now().strftime("%Y-%m-%d"):
                    # Set the start hour and minute based on the rounded time
                    start_hour = int(time_now[:2])
                    start_minute = int(time_now[3:])
                else:
                    # Set the start hour and minute based on doctor schedule
                    start_hour = schedule.start_time.hour
                    start_minute = 0

                # Loop through the specified time range for the day
                for j in range(start_hour * 60 + start_minute, schedule.end_time.hour * 60, 15):
                    # If the schedule has a lunchbreak and j is in the range of the lunch break do nothing
                    if schedule.lunch_time and j in range(schedule.lunch_time.hour * 60, (schedule.lunch_time.hour + 1) * 60):
                        continue
 
                    else:
                        # Set the hour
                        hour = j // 60

                        # Check if the first iteration, set the starting minute accordingly
                        if j == start_hour * 60 + start_minute:
                            minute = start_minute 
                        else:
                            minute = int(((j / 60) % 1) * 60)

                        # Check that there is not already an existing booking and add the timeslot to the timeslots list
                        if not dailyAppointments.filter(time=time(hour, minute, 0)).exists():
                            timeslots.append(f'{hour:02}:{minute:02}')

                # Create a daily bookings list and append to the doctor bookings list
                daily_bookings = {'date' : selectedDate, 'day' : selectedDay, 'times' : timeslots}
                doctor_bookings.append(daily_bookings)

        # Add the doctor bookings to the bookings dictionary 
        bookings[doctor.id] = doctor_bookings

    # Return the bookings data as JSON data
    return JsonResponse({"dates" : dates, "bookings" : bookings}, safe=False)

def book_appointment(request):
    if request.method == "POST":

        data = json.loads(request.body)

        # Set data from POST data
        first_name      = data["first_name"]
        last_name       = data["last_name"]
        doctor_id       = data['doctor_id']
        time            = data['time']
        date            = data['date']
        patient_notes   = data['note']

        # Get the doctor object
        doctor = Doctor.objects.get(pk=doctor_id)

        # Check the timeslot hasn't been booked
        if checkBookingAvailability(doctor, time, date):
            # Set the user and patient objects
            user = User.objects.get(first_name=first_name, last_name=last_name)
            patient = Patient.objects.get(user=user)
            
            # Create the appointment
            Appointment.objects.create(patient=patient, doctor=doctor, time=time, date=date, patient_notes=patient_notes).save()

            return HttpResponse(status=200)
        else:
            return HttpResponse(status=409)

def account(request):
    # Get the user
    user = request.user

    # Check if user is a doctor. Set the account and appointments accordingly to type of user
    if not user.is_doctor:
        account = Patient.objects.get(user=user)
        appointments = Appointment.objects.filter(patient=account)
        past_appointments = appointments.filter(date__lt=date.today())
        upcoming_appointments = appointments.filter(date__gte=date.today())
    else:
        account = Doctor.objects.get(user=user)
        appointments = Appointment.objects.filter(doctor=account)
        past_appointments = appointments.filter(date__lt=date.today())
        upcoming_appointments = appointments.filter(date__gt=date.today())

    return render(request, "medical_practice/account.html", {
        "account" : account,
        "past_appointments" : past_appointments.order_by('date', 'time'),
        "upcoming_appointments" : upcoming_appointments.order_by('date', 'time'),
        "appointments_today" : appointments.filter(date=date.today()).order_by('time')
    })

def save_doctors_notes(request):
    if request.method == "POST":

        data = json.loads(request.body)

        # Set the appointment ID and doctor note based on the POST data
        appointment_id = data["appointment_id"]
        doctors_note = data["note"]
        
        try:
            # If the appointment exists update the doctor note
            Appointment.objects.filter(pk=appointment_id).update(doctor_notes=doctors_note)
            return HttpResponse(status=200)
        
        except Appointment.DoesNotExist:
            return HttpResponse(status=409)

def checkBookingAvailability(doctor, time, date):
    # Check if the appointment for the doctor date and time already exists
    try:
        Appointment.objects.get(doctor=doctor, time=time, date=date)
        return False

    except Appointment.DoesNotExist:
        return True
    
def round_time_nearest_quarter(time):
    # Set the hour and minute as integers
    hour = int(time[:2])
    minute = int(time[3:])

    # Round the the minute up to nearest 15 interval
    rounded_minute = 15 * math.ceil(minute / 15)

    # Increase hour by 1 if the rounded minute equals 60 and set the rounded minute to 0
    if rounded_minute == 60:
        hour = hour + 1
        rounded_minute = 0

    # Create a new formatted time string and return it
    rounded_time = f'{hour:02}:{rounded_minute:02}'

    return rounded_time