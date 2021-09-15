from django.contrib import admin
from .models import Member


# Register your models here.
@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'picture')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 10
    search_fields = ('name', 'title')
