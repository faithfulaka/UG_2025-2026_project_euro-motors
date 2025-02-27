from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from euromotors.models import Car
from euromotors.serializers import CarSerializer


@api_view(["GET"])
def get_all_cars(request):
    """Fetch all cars from the database."""
    cars = Car.objects.all()
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)


