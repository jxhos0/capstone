from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone

from django.http import JsonResponse

from datetime import date, time, timedelta

from .models import *
# Create your views here.
def index(request):
    return render(request, "medical_practice/index.html")

def services(request):
    services = Service.objects.all()
    return render(request, "medical_practice/services.html", {
        "services" : services
    })

def team(request):
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

def billing(request):
    return render(request, "medical_practice/billing.html")

def load_service(request, service_id):
    try:
        service = Service.objects.get(pk=service_id)
    except Service.DoesNotExist:
        return JsonResponse({"error": "Service not found."}, status=404)
    
    if request.method == "GET":
        return JsonResponse(service.serialize())
    

def load_service(request, service_id):
    try:
        service = Service.objects.get(pk=service_id)
    except Service.DoesNotExist:
        return JsonResponse({"error": "Service not found."}, status=404)
    
    if request.method == "GET":
        return JsonResponse(service.serialize())
    
def load_doctor_schedule(request):
    schedules = DoctorSchedule.objects.all()

    return JsonResponse([schedule.serialize() for schedule in schedules], safe=False)


def load_booking_timeslots(request):

    doctors = Doctor.objects.all()

    schedules = DoctorSchedule.objects.all()

    appointments = Appointment.objects.filter(date__gte=timezone.now(), date__lte=timezone.now() + timedelta(days = 4))

    bookings = {}

    today = date.today()
    dayToday = today.weekday() + 1  if today.weekday() + 1 < 7 else today.weekday() + 1 - 7 # Add one to keep with js assignment of day integers
    # print(today + timedelta(days=4))

    for doctor in doctors:
        # print(doctor)
        doctor_schedule = schedules.filter(doctor=doctor)
        doctor_bookings = []
        for i in range(0, 5):
            selectedDate = today + timedelta(days=i)
            selectedDay = dayToday + i
            daily_schedules = doctor_schedule.filter(day=selectedDay)
            dailyAppointments = appointments.filter(doctor=doctor, date=selectedDate)
                      
            # print(selectedDate)
            for schedule in daily_schedules:
                timeslots = []
                
                for j in range(schedule.start_time.hour * 60, schedule.end_time.hour * 60, 15):
                    hour = j // 60

                    minute = int(((j / 60) % 1) * 60)

                    if not dailyAppointments.filter(time=time(hour, minute, 0)).exists():
                        timeslots.append(f'{hour:02}:{minute:02}')

       

                daily_bookings = {'date' : selectedDate, 'day' : selectedDay, 'times' : timeslots}
                doctor_bookings.append(daily_bookings)

        bookings[doctor.id] = doctor_bookings
    # print(bookings)
    return JsonResponse({"start_date" : today, "bookings" : bookings}, safe=False)
            
