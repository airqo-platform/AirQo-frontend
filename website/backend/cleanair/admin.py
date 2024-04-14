import nested_admin
from django.contrib import admin
from .models import CleanAirResource, ForumEvent, Partner, Program, Session, Support, Person, Engagement, Objective

# Inlines


class ObjectiveInline(nested_admin.NestedTabularInline):
    model = Objective
    extra = 0


class EngagementInline(nested_admin.NestedTabularInline):
    model = Engagement
    inlines = [ObjectiveInline]
    extra = 0


class SessionInline(nested_admin.NestedTabularInline):
    model = Session
    extra = 0


class PartnerInline(nested_admin.NestedTabularInline):
    model = Partner
    extra = 0


class SupportInline(nested_admin.NestedTabularInline):
    model = Support
    extra = 0

# Admins


@admin.register(CleanAirResource)
class CleanAirResourceAdmin(admin.ModelAdmin):
    list_display = ('resource_title', 'resource_category', 'order', 'author')
    list_filter = ('resource_category', 'author')
    search_fields = ('resource_title', 'author_title')
    readonly_fields = ('author', 'updated_by')
    list_per_page = 12


@admin.register(ForumEvent)
class ForumEventAdmin(nested_admin.NestedModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'author', 'order')
    list_filter = ('start_date', 'end_date')
    search_fields = ('title',)
    readonly_fields = ('author', 'updated_by')
    list_per_page = 12
    inlines = [EngagementInline, PartnerInline, SupportInline]


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'forum_event', 'category', 'image_preview')
    list_filter = ('forum_event',)
    search_fields = ('name', 'category', 'forum_event',)
    list_per_page = 12

    # display image preview
    def image_preview(self, obj):
        width, height = 100, 200
        from django.utils.html import escape, format_html

        return format_html(f'<img src="{escape(obj.picture.url)}" height="{width}" />')


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'forum_event',)
    list_filter = ('forum_event',)
    search_fields = ('title', 'forum_event',)
    list_per_page = 12
    inlines = [SessionInline]
