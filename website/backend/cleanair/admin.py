import nested_admin
from django.contrib import admin
from .models import CleanAirResource, ForumEvent, Partner, Program, Session, Support, Person, Engagement, Objective

# Register your models here.


@admin.register(CleanAirResource)
class CleanAirResourceAdmin(admin.ModelAdmin):
    list_display = ('resource_title', 'resource_category', 'order', 'author')
    list_filter = ('resource_category', 'author')
    search_fields = ('resource_title', 'author_title')
    readonly_fields = ('author', 'updated_by')
    list_per_page = 12


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


class ProgramInline(nested_admin.NestedTabularInline):
    model = Program
    inlines = [SessionInline]
    extra = 0


class PersonInline(nested_admin.NestedTabularInline):
    model = Person
    extra = 0


class PartnerInline(nested_admin.NestedTabularInline):
    model = Partner
    extra = 0


class SupportInline(nested_admin.NestedTabularInline):
    model = Support
    extra = 0


@admin.register(ForumEvent)
class ForumEventAdmin(nested_admin.NestedModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'author', 'order')
    list_filter = ('start_date', 'end_date')
    search_fields = ('title',)
    readonly_fields = ('author', 'updated_by')
    list_per_page = 12
    inlines = [EngagementInline, PersonInline,
               ProgramInline, PartnerInline, SupportInline]
