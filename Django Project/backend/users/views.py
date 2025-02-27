from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse

def placeholder_view(request):
    return JsonResponse({"message": "This is a placeholder view for users."})
