from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Create a simple home view
def home(request):
    return JsonResponse({"message": "Welcome to Euro Motors API"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),  
    path("api/", include("euromotors.urls")),  # This should correctly point to your API routes
]
