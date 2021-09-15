from django.contrib import admin
from .models import Career


# Register your models here.
@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'expiry')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 10
    search_fields = ('time', 'expiry')
