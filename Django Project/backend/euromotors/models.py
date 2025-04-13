from django.db import models
from django.contrib.auth.models import User  


class RentalCar(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to="rentals/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.name} - ${self.price_per_day}/day"


class RentalOrder(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rental_orders")
    rental_car = models.ForeignKey(RentalCar, on_delete=models.CASCADE, related_name="rental_orders")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")],
        default="Pending",
    )

    def save(self, *args, **kwargs):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before the start date.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rental {self.id} - {self.customer.username} - {self.rental_car.name}"


class Showroom(models.Model):
    location = models.CharField(max_length=255)
    manager = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)

    def __str__(self):
        return f"Showroom - {self.location}"


class Car(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_for_rent = models.BooleanField(default=False)
    is_for_sale = models.BooleanField(default=True)
    image = models.ImageField(upload_to="cars/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True) 

    def __str__(self):
        return f"{self.brand} {self.name}"


class TradeIn(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trade_ins")
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="trade_ins")
    plate_number = models.CharField(max_length=20, unique=True)
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")],
        default="pending",
    )

    def __str__(self):
        return f"Trade-In Request: {self.plate_number} - {self.status}"


class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="orders")
    order_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(
        max_length=50, choices=[("Cash", "Cash"), ("Monthly Payment", "Monthly Payment")]
    )
    status = models.CharField(
        max_length=50,
        choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")],
        default="Pending",
    )
    trade_in = models.OneToOneField(
        TradeIn, on_delete=models.SET_NULL, null=True, blank=True, related_name="trade_in_order"
    )  

    def __str__(self):
        trade_info = f" (Trade-In: {self.trade_in.plate_number})" if self.trade_in else ""
        return f"Order {self.id} - {self.customer.username} - {self.car.name}{trade_info}"
