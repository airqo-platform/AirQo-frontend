from django.contrib import admin
from .models import ImpactNumber

# Register your models here.
@admin.register(ImpactNumber)
class ImpactAdmin(admin.ModelAdmin):
    fields = ('african_cities', 'champions', 'deployed_monitors', 'data_records', 'research_papers', 'partners',)
    list_display = ('modified','updated_by')

