from modeltranslation.admin import TranslationAdmin
from django.contrib import admin
from .models import Publication
from .translation import *


@admin.register(Publication)
class PublicationAdmin(TranslationAdmin):
    list_display = ("title", "category", "authors")
    list_filter = ("category", "created")
    list_per_page = 10
    search_fields = ("title", "category", "authors")
    readonly_fields = (
        "id",
        "created",
        "author",
        "updated_by",
        "modified"
    )
    fields = (
        "title",
        "authors",
        "category",
        "link",
        "link_title",
        "resource_file",
        "order",
        "created",
        "author",
        "modified",
        "updated_by"
    )
