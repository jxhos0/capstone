from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("services", views.services, name="services"),
    path("team", views.team, name="team"),
    path("practice-information", views.practiceInformation, name="practice-information"),
    path("contact", views.contact, name="contact"),
    path("book", views.book, name="book"),
    path("billing", views.billing, name="billing"),

    # API Routes
    path("service/<int:service_id>", views.load_service, name="load_service"),
    path("doctor/schedule", views.load_doctor_schedule, name="load_doctor_schedule"),
    path("bookings", views.load_booking_timeslots, name="bookings"),
]