from django.contrib import admin
from .models import Casing, Stock, Production, StockHistory

# Register your models here.

admin.site.register(Casing)
admin.site.register(Production)
admin.site.register(Stock)
admin.site.register(StockHistory)