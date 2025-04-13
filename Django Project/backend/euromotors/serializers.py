from rest_framework import serializers
from .models import Car,TradeIn, Order 

class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = "__all__"
 

class TradeInSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeIn
        fields = "__all__"

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"
