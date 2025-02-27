from django.contrib import admin
from .models import Car, Order, TradeIn, RentalCar, RentalOrder, Showroom


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("brand", "name", "price", "is_for_sale", "is_for_rent")  
    list_filter = ("is_for_sale", "is_for_rent")  
    search_fields = ("name", "brand")


@admin.register(TradeIn)
class TradeInAdmin(admin.ModelAdmin):
    list_display = ("user", "car", "plate_number", "estimated_value", "status")  
    list_filter = ("status",)
    search_fields = ("plate_number", "user__username")
    actions = ["approve_trade_in", "reject_trade_in"]

    def approve_trade_in(self, request, queryset):
        queryset.update(status="approved")

    approve_trade_in.short_description = "Approve selected trade-ins"

    def reject_trade_in(self, request, queryset):
        queryset.update(status="rejected")

    reject_trade_in.short_description = "Reject selected trade-ins"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("customer", "car", "order_date", "payment_method", "status")
    list_filter = ("status", "payment_method")
    search_fields = ("customer__username", "car__name")
    actions = ["approve_order", "reject_order"]

    def approve_order(self, request, queryset):
        queryset.update(status="approved")

    approve_order.short_description = "Approve selected orders"

    def reject_order(self, request, queryset):
        queryset.update(status="rejected")

    reject_order.short_description = "Reject selected orders"

# Register remaining models
admin.site.register(RentalCar)
admin.site.register(RentalOrder)
admin.site.register(Showroom)
