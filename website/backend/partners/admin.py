from django.contrib import admin
import nested_admin

from .models import Partner, PartnerDescription

class PartnerDescriptionInline(nested_admin.NestedTabularInline):
    fields = ('description', 'author', 'order')
    readonly_fields = ('author', )
    model = PartnerDescription
    extra = 0

@admin.register(Partner)
class PartnerAdmin(nested_admin.NestedModelAdmin):
    list_display = ('id', 'partner_name','type', 'logo_preview', 'image_preview')
    readonly_fields = ('id', 'author', 'created', 'updated_by', 'modified')

    fields = ('id','partner_name','type', 'partner_logo','partner_image','partner_link','order','author', 'created', 'updated_by', 'modified')
    list_per_page = 10
    search_fields = ('partner_name','type')

    inlines = (PartnerDescriptionInline,)

    def logo_preview(self, obj):
        width, height = 100, 80
        from django.utils.html import escape, format_html

        return format_html(f'<img src="{escape(obj.partner_logo.url)}" width="{width}" height="{height}" />')

    logo_preview.allow_tags = True

    def image_preview(self, obj):
        width, height = 120, 80
        from django.utils.html import escape, format_html

        if obj.partner_image:
            return format_html(f'<img src="{escape(obj.partner_image.url)}" width="{width}" height="{height}" />')

    image_preview.allow_tags = True
