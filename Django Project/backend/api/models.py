from django.db import models
from django.contrib.auth.models import User  # Using built-in User model

class Car(models.Model):
    """Model representing an giavailable car for sale or rent"""
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    year = models.IntegerField()
    fuel_type = models.CharField(
        max_length=50,
        choices=[("Petrol", "Petrol"), ("Diesel", "Diesel"), ("Electric", "Electric")],
    )
    transmission = models.CharField(
        max_length=50, choices=[("Automatic", "Automatic"), ("Manual", "Manual")]
    )
    mileage = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="cars/", blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_for_sale = models.BooleanField(default=True)
    is_for_rent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.year})"


class TradeIn(models.Model):
    """Model for trade-in requests, optionally linked to a purchase"""
    user = models.ForeignKey("users.UserProfile", on_delete=models.CASCADE)
    car_model = models.CharField(max_length=255)
    plate_number = models.CharField(max_length=20, unique=True)
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")],
        default="Pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trade-In: {self.plate_number} ({self.user.user.username})"


class Order(models.Model):
    """Model representing a car purchase request, optionally with a trade-in"""
    customer = models.ForeignKey("users.UserProfile", on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    trade_in = models.OneToOneField(TradeIn, on_delete=models.SET_NULL, null=True, blank=True)
    order_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(
        max_length=50,
        choices=[("Cash", "Cash"), ("Monthly Payment", "Monthly Payment")],
    )
    status = models.CharField(
        max_length=50,
        choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")],
        default="Pending",
    )

    def __str__(self):
        return f"Order {self.id} - {self.customer.user.username} - {self.car.name}"
