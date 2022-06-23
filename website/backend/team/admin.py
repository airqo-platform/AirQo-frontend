from django.contrib import admin
from .models import Member


# Register your models here.
@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "image_tag")
    readonly_fields = (
        "id",
        "created",
        "author",
        "updated_by",
        "modified",
        "image_tag",
    )
    fields = (
        "id",
        "name",
        "title",
        "about",
        "picture",
        "image_tag",
        "twitter",
        "linked_in",
        "order",
        "created",
        "modified",
        "author",
        "updated_by",
    )
    list_per_page = 10
    search_fields = ("name", "title")

    def image_tag(self, obj):
        width, height = 100, 200
        from django.utils.html import escape, format_html

        return format_html(f'<img src="{escape(obj.picture.url)}" height="{width}" />')

    image_tag.short_description = "Image Preview"
    image_tag.allow_tags = True
