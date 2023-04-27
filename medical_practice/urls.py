from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("services", views.services, name="services"),
    path("team", views.team, name="team"),
    path("practice-information", views.practiceInformation, name="practice-information"),
    path("contact", views.contact, name="contact"),
    path("book", views.book, name="book"),
    path("appointments", views.appointments, name="appointments"),


    # API Routes
    path("service/<int:service_id>", views.load_service, name="load_service"),
    path("doctor/schedule", views.load_doctor_schedule, name="load_doctor_schedule"),
    path("bookings/<str:date_string>", views.load_booking_timeslots, name="bookings"),
    path("confirm_patient", views.confirm_patient, name="confirm_patient"),
    # path("register", views.register, name="register"),
    path("book_appointment", views.book_appointment, name="book_appointment")
]