from django.contrib import admin
import nested_admin
from .models import AfricanCountry, City, Content, Image, Description
from modeltranslation.admin import TranslationAdmin
from .translation import *

# Register your models here.


class ImageInline(nested_admin.NestedTabularInline):
    fields = ('image', 'order')
    readonly_fields = ('author', 'updated_by')
    model = Image
    extra = 0


class DescriptionInline(nested_admin.NestedTabularInline):
    fields = ('paragraph_en', 'paragraph_fr', 'order')
    readonly_fields = ('author', 'updated_by')
    model = Description
    extra = 0


class ContentInline(nested_admin.NestedStackedInline):
    fields = ('title_en', 'title_fr', 'order')
    readonly_fields = ('author', 'updated_by')
    model = Content
    extra = 0
    inlines = (DescriptionInline, ImageInline,)


class CityInline(nested_admin.NestedTabularInline):
    fields = ('city_name_en', 'city_name_fr', 'order')
    readonly_fields = ('author', 'updated_by')
    model = City
    extra = 0
    inlines = (ContentInline,)


@admin.register(AfricanCountry)
class AfricanCitiesAdmin(TranslationAdmin, nested_admin.NestedModelAdmin):
    fields = ('country_name', 'country_flag', 'order', 'author', 'updated_by')
    readonly_fields = ('id', 'author', 'created', 'updated_by', 'modified')
    list_display = ('country_name', 'flag_preview', 'order', 'author')
    search_fields = ('country_name', 'author')
    list_filter = ('created',)
    inlines = (CityInline,)
    list_per_page = 10

    def flag_preview(self, obj):
        width, height = 60, 40
        from django.utils.html import escape, format_html

        return format_html(f'<img src="{escape(obj.country_flag.url)}" width="{width}" height="{height}" />')

    flag_preview.allow_tags = True
