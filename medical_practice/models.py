from django.db import models
from django.core.validators import RegexValidator

from datetime import timedelta
# from django.contrib.auth.models import AbstractUser

# Create your models here.

class Service(models.Model):
    title       = models.CharField(max_length=32)
    description = models.TextField(max_length=300, blank=False, null=False)

    def __str__(self):
        return f'{self.title}'
    
    def serialize(self):
        return {
            "id" : self.id,
            "title" : self.title,
            "description" : self.description
        }

class Patient(models.Model):

    first_name  = models.CharField(max_length=32, blank=False, null=False)
    last_name   = models.CharField(max_length=32, blank=False, null=False)
    gender      = models.CharField(max_length=10, blank=False, null=True)
    dob         = models.DateField(max_length=8, blank=False, null=False)
    phone       = models.CharField(max_length=16, validators=[RegexValidator(r'^\d{3}-\d{3}-\d{4}$')], blank=False, null=False)
    email       = models.EmailField(max_length=254)

    def __str__(self) :
        return f'{self.first_name} {self.last_name}, DOB: {self.dob}, Phone: {self.phone}'
    
class Doctor(models.Model):
    first_name      = models.CharField(max_length=32, blank=False, null=False)
    last_name       = models.CharField(max_length=32, blank=False, null=False)
    gender          = models.CharField(max_length=10, blank=False, null=False)
    photo           = models.ImageField(null=True, blank=True, default=None, upload_to="images/")
    qualifications  = models.CharField(max_length=254, blank=False, null=False)
    languages       = models.CharField(max_length=32, blank=False, null=False)
    summary         = models.TextField(max_length=2000, blank=False, null=False)

    def __str__(self):
        return f'Doctor ID: {self.id}, {self.first_name} {self.last_name}, Qualifications: {self.qualifications}'

class DoctorSchedule(models.Model):
    daysOfWeek = [
        ('Sun', 'Sunday'),
        ('Mon', 'Monday'),
        ('Tue', 'Tuesday'),
        ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'),
        ('Fri', 'Friday'),
        ('Sat', 'Saturday'),
    ]

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='doctor')
    day = models.CharField(max_length=10, choices=daysOfWeek, blank=True)
    start_time = models.TimeField(blank=True, null=True)
    lunch_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    def __str__(self):
        return f'Dr {self.doctor.last_name} available {self.day} from {self.start_time} till {self.end_time}'
# class Appointment(models.Model):
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient')
#     doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
  
# DoctorSchedule.objects.create(doctor=Doctor.objects.get(pk=1), day='Wed', start_time=datetime.time(9, 0, 0), lunch=datetime.time(13, 0, 0), shift_duration=8)

