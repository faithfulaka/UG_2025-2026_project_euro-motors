from django.urls import path
from .views import get_all_cars, get_cars_for_sale, get_cars_for_rent, trade_in_car, create_order

urlpatterns = [
    path("cars/", get_all_cars, name="get_all_cars"),
    path("cars/sale/", get_cars_for_sale, name="get_cars_for_sale"),
    path("cars/rent/", get_cars_for_rent, name="get_cars_for_rent"),
    path("trade-in/", trade_in_car, name="trade_in_car"),
    path("order/", create_order, name="create_order"),
]
