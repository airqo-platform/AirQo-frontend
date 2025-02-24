from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .translation import *
from .models import Highlight, Tag


@admin.register(Highlight)
class HighlightAdmin(TranslationAdmin):
    list_display = ("title", "highlight_tags", "image_preview", "created")
    list_filter = ("tags", "created")
    list_per_page = 8
    search_fields = ("title", "tags")
    readonly_fields = (
        "id",
        "created",
        "author",
        "updated_by",
        "modified",
        "image_preview",
    )
    fields = (
        "title",
        "link",
        "link_title",
        "tags",
        "image",
        "order",
        "created",
        "author",
        "modified",
        "updated_by"
    )

    def highlight_tags(self, instance):
        return [tag.name for tag in instance.tags.all()]

    def image_preview(self, obj):
        width, height = 120, 100
        from django.utils.html import escape, format_html

        return format_html(f'<img src="{escape(obj.image.url)}" width="{width}" height="{height}" />')

    image_preview.allow_tags = True


@admin.register(Tag)
class TagAdmin(TranslationAdmin):
    list_display = ("id", "name", "created")
    list_filter = ("name", )
    list_per_page = 10
    search_fields = ("name", "id")
    readonly_fields = (
        "id",
        "created",
        "author",
        "updated_by",
        "modified",
    )
    fields = (
        "name",
        "author",
        "modified",
        "updated_by"
    )
