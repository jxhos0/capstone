from django.db import models
from django.core.validators import RegexValidator
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
        return f'{self.first_name} {self.last_name}, Qualifications: {self.qualifications}'

