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
    path("account", views.account, name="account"),


    # API Routes
    path("doctor/schedule", views.load_doctor_schedule, name="load_doctor_schedule"),
    path("bookings/<str:date_string>", views.load_booking_timeslots, name="bookings"),
    path("confirm-patient", views.confirm_patient, name="confirm_patient"),
    path("book_appointment", views.book_appointment, name="book_appointment"),
    path("save_doctors_notes", views.save_doctors_notes, name="save_doctors_notes"),
]