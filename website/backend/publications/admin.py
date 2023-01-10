from django.contrib import admin
from .models import Publication

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ("title", "category","authors")
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
        "order",
        "created",
        "author",
        "modified",
        "updated_by"
    )
