from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Car, TradeIn, Order
from .serializers import CarSerializer, TradeInSerializer, OrderSerializer
import requests

@api_view(["GET"])
def get_all_cars(request):
    """Fetch all cars from the database."""
    cars = Car.objects.all()
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_cars_for_sale(request):
    """Fetch all cars available for sale."""
    cars = Car.objects.filter(is_for_sale=True)
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_cars_for_rent(request):
    """Fetch all cars available for rent."""
    cars = Car.objects.filter(is_for_rent=True)
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trade_in_car(request):
    """User submits car plate number for trade-in estimate"""
    plate_number = request.data.get("plate_number")
    car_model = request.data.get("car_model")

    # Simulating API call to external trade-in valuation service
    response = requests.get(f"https://car-value-api.com/estimate/{plate_number}")

    if response.status_code == 200:
        estimated_value = response.json().get("estimated_value")
        trade_in = TradeIn.objects.create(
            user=request.user.userprofile,  # Ensure UserProfile is linked
            car_model=car_model,
            plate_number=plate_number,
            estimated_value=estimated_value
        )
        return Response({"message": "Trade-in request submitted", "trade_in": TradeInSerializer(trade_in).data})

    return Response({"error": "Could not estimate car value"}, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    """User submits a car purchase request, optionally with a trade-in"""
    car_id = request.data.get("car_id")
    trade_in_id = request.data.get("trade_in_id")  # Optional
    payment_method = request.data.get("payment_method")

    try:
        car = Car.objects.get(id=car_id)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=404)

    trade_in = None
    if trade_in_id:
        try:
            trade_in = TradeIn.objects.get(id=trade_in_id, user=request.user.userprofile)
        except TradeIn.DoesNotExist:
            return Response({"error": "Trade-in request not found"}, status=404)

    order = Order.objects.create(
        customer=request.user.userprofile,
        car=car,
        trade_in=trade_in,
        payment_method=payment_method
    )

    return Response({"message": "Order submitted", "order": OrderSerializer(order).data})
