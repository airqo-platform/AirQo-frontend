from django.contrib import admin
from .models import CleanAirResource

# Register your models here.
@admin.register(CleanAirResource)
class CleanAirResourceAdmin(admin.ModelAdmin):
    fields = ('resource_category','resource_title', 'resource_link', 'resource_file', 'author_title','resource_authors','order',)
    list_filter = ("resource_category",'created')
    list_display=('resource_title','resource_category','order','author')
    search_fields = ("resource_title",'author')
    list_per_page = 12
