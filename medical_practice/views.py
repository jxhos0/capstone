from django.shortcuts import render
from django.http import HttpResponse

from django.http import JsonResponse

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