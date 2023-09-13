from django.contrib import admin
from .models import Press

@admin.register(Press)
class PressAdmin(admin.ModelAdmin):
    list_display = ("article_title", "date_published", "logo_preview", "website_category","created")
    list_filter = ("website_category","date_published",)
    list_per_page = 12
    search_fields = ("article_title", "date_published")
    readonly_fields = (
        "id",
        "created",
        "author",
        "updated_by",
        "modified",
        "logo_preview",
    )
    fields = (
        "article_title",
        "article_intro",
        "website_category",
        "article_tag",
        "article_link",
        "date_published",
        "publisher_logo",
        "order",
        "created",
        "author",
        "modified",
        "updated_by"
    )

    def logo_preview(self, obj):
        width, height = 140, 60
        from django.utils.html import escape, format_html

        if obj.publisher_logo and obj.publisher_logo.url:
            return format_html(f'<img src="{escape(obj.publisher_logo.url)}" width="{width}" height="{height}" />')

    logo_preview.allow_tags = True
