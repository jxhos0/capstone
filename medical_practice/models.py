from django.db import models
from django.contrib.auth.models import AbstractUser

from django.core.validators import RegexValidator, MinLengthValidator

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

class User(AbstractUser):
    first_name  = models.CharField(max_length=32, blank=False, null=False)
    last_name   = models.CharField(max_length=32, blank=False, null=False)
    gender      = models.CharField(max_length=10, blank=False, null=False)
    dob         = models.DateField(max_length=8, blank=False, null=False)
    phone       = models.CharField(max_length=16, blank=False, null=False)   #change regex here validators=[RegexValidator(r'^\d{3}-\d{3}-\d{4}$')]
    email       = models.EmailField(max_length=254)

class Patient(models.Model):
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient')
    smokes      = models.CharField(max_length=10, choices=[('1', 'Yes'), ('2', 'No'), ('3', 'Used to')], blank=True)
    drinks      = models.CharField(max_length=10, choices=[('1', 'Yes'), ('2', 'No'), ('3', 'Used to')], blank=True)
    # allergies     needs to be many field
    # on_prescriptions
    # past_surgeries needs to be many field

    def __str__(self) :
        return f'{self.user.first_name} {self.user.last_name}, DOB: {self.user.dob}, Phone: {self.user.phone}'
    
class Doctor(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor')
    photo           = models.ImageField(null=True, blank=True, default=None, upload_to='images/')
    qualifications  = models.CharField(max_length=254, blank=False, null=False)
    languages       = models.CharField(max_length=32, blank=False, null=False)
    summary         = models.TextField(max_length=2000, blank=False, null=False)

    def __str__(self):
        return f'Doctor ID: {self.id}, {self.user.first_name} {self.user.last_name}, Qualifications: {self.qualifications}'

class DoctorSchedule(models.Model):
    daysOfWeek = [
        ('0', 'Sunday'),
        ('1', 'Monday'),
        ('2', 'Tuesday'),
        ('3', 'Wednesday'),
        ('4', 'Thursday'),
        ('5', 'Friday'),
        ('6', 'Saturday'),
    ]

    doctor      = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='doctor')
    day         = models.CharField(max_length=10, choices=daysOfWeek, blank=True)
    start_time  = models.TimeField(blank=True, null=True)
    lunch_time  = models.TimeField(blank=True, null=True)
    end_time    = models.TimeField(blank=True, null=True)

    def __str__(self):
        return f'Dr {self.doctor.last_name} available {self.daysOfWeek[int(self.day)][1]} from {self.start_time} till {self.end_time}, {"has lunch" if self.lunch_time else ""}'
    
    def serialize(self):
        return {
            "doctor"        : self.doctor.id,
            "day"           : int(self.day),
            "start_time"    : self.start_time,
            "lunch_time"    : self.lunch_time,
            "end_time"      : self.end_time
        }
    
class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='booked_patient')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='booked_doctor')
    date = models.DateField(max_length=8, blank=False, null=False)
    time = models.TimeField(blank=True, null=True)

    def __str__(self):
        return f'{self.patient.first_name} booked with Dr {self.doctor.last_name}, on {self.date} at {self.time}'
  
# DoctorSchedule.objects.create(doctor=Doctor.objects.get(pk=1), day='Wed', start_time=datetime.time(9, 0, 0), lunch=datetime.time(13, 0, 0), shift_duration=8)

