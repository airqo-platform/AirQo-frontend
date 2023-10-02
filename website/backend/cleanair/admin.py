from django.contrib import admin
from .models import CleanAirResource

# Register your models here.
@admin.register(CleanAirResource)
class CleanAirResourceAdmin(admin.ModelAdmin):
    fields = ('resource_title', 'resource_link', 'resource_file', 'order',)
    list_filter = ("author",'created')
    list_display=('resource_title','order','author','created')
    search_fields = ("resource_title",)
    list_per_page = 12
