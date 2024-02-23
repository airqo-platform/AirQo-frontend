from django.contrib import admin
from .models import FAQ
from modeltranslation.admin import TranslationAdmin
from .translation import *


# Register your models here.
@admin.register(FAQ)
class FAQAdmin(TranslationAdmin):
    list_display = ('question', 'answer', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 10
    search_fields = ('question', 'answer')
