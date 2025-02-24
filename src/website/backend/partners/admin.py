from django.contrib import admin
import nested_admin
from .models import Partner, PartnerDescription
from modeltranslation.admin import TranslationAdmin
from .translation import *


class PartnerDescriptionInline(nested_admin.NestedTabularInline):
    fields = ('description_en', 'description_fr', 'author', 'order')
    readonly_fields = ('author', )
    model = PartnerDescription
    extra = 0


@admin.register(Partner)
class PartnerAdmin(TranslationAdmin, nested_admin.NestedModelAdmin):
    list_display = ('partner_name', 'website_category',
                    'type', 'logo_preview', 'image_preview')
    readonly_fields = ('author', 'created', 'updated_by', 'modified')
    list_filter = ('website_category', 'type',)

    fields = ('partner_name', 'website_category', 'type', 'partner_logo', 'partner_image',
              'partner_link', 'order', 'author', 'created', 'updated_by', 'modified')
    list_per_page = 10
    search_fields = ('partner_name', 'type')

    inlines = (PartnerDescriptionInline,)

    def logo_preview(self, obj):
        width, height = 65, 50
        from django.utils.html import escape, format_html

        return format_html(f'<img src="{escape(obj.partner_logo.url)}" width="{width}" height="{height}" />')

    logo_preview.allow_tags = True

    def image_preview(self, obj):
        width, height = 120, 80
        from django.utils.html import escape, format_html

        if obj.partner_image:
            return format_html(f'<img src="{escape(obj.partner_image.url)}" width="{width}" height="{height}" />')

    image_preview.allow_tags = True
