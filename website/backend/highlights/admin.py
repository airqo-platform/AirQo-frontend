from django.contrib import admin

from .models import Highlight

# Register your models here.
@admin.register(Highlight)
class HighlightAdmin(admin.ModelAdmin):
    list_display = ("title", "get_tags")
    list_filter = ("tags", "created_at")
    list_per_page = 15
    search_fields = ("title", "tags")
    readonly_fields = (
        "id",
        "created",
        "created_at",
        "author",
        "updated_by",
        "modified",
    )
    fields = (
        "title",
        "link",
        "tags",
        "image",
        "created",
        "author",
        "modified",
        "updated_by"
    )

    def get_tags(self, instance):
        return [tag.name for tag in instance.tags.all()]
