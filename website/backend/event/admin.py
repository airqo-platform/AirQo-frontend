import nested_admin
from .translation import *
from django.contrib import admin
from .models import Event, Program, Session, PartnerLogo, Inquiry, Resource
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline, TranslationTabularInline


class InquiryInline(nested_admin.NestedStackedInline):
    fields = ('inquiry', 'role', 'email', 'order')
    readonly_fields = ('author', 'updated_by')
    model = Inquiry
    extra = 0


class SessionInline(TranslationTabularInline, nested_admin.NestedStackedInline):
    fields = ('session_title', 'session_details',
              'venue', 'start_time', 'end_time', 'order')
    readonly_fields = ('author', 'updated_by')
    model = Session
    extra = 0


class ProgramInline(nested_admin.NestedTabularInline):
    fields = ('date', 'program_details_en',
              'program_details_fr', 'order')  # Add translated fields here
    readonly_fields = ('author', 'updated_by')
    model = Program
    inlines = [SessionInline]
    extra = 0


class PartnerLogoInline(TranslationTabularInline, nested_admin.NestedTabularInline):
    model = PartnerLogo
    extra = 0
    fields = ('name', 'partner_logo', 'order')
    readonly_fields = ('author', 'updated_by')


class ResourceInline(TranslationTabularInline, nested_admin.NestedTabularInline):
    model = Resource
    extra = 0
    fields = ('title', 'link', 'resource', 'order')
    readonly_fields = ('author', 'updated_by')


@admin.register(Event)
class EventAdmin(TranslationAdmin, nested_admin.NestedModelAdmin):
    model = Event
    fields = ('title', 'title_subtext', 'start_date', 'end_date', 'start_time', 'end_time', 'website_category', 'registration_link',
              'event_tag', 'event_category', 'event_image', 'background_image', 'location_name', 'location_link', 'event_details', 'order', 'author', 'updated_by')
    readonly_fields = ('id', 'author', 'created', 'updated_by', 'modified')
    list_display = ('title', 'start_date', 'event_tag',
                    'website_category', 'author')
    search_fields = ('title', 'event_tag', 'location_name')
    list_filter = ('website_category', 'event_tag', 'start_date',)
    inlines = [ProgramInline, PartnerLogoInline, InquiryInline, ResourceInline]
    list_per_page = 10


@admin.register(Resource)
class ResourceAdmin(TranslationAdmin):
    model = Resource
    fields = ('event', 'title', 'link', 'resource', 'order')
    list_display = ('title', 'event', 'author',)
    search_fields = ('event', 'title',)
    list_filter = ('author', 'created')
    list_per_page = 10
