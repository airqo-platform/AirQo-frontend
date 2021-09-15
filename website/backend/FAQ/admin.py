from django.contrib import admin
from .models import FAQ


# Register your models here.
@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'answer', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 10
    search_fields = ('question', 'answer')
