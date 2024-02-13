from .translation import *
from django.contrib import admin
import nested_admin
from .models import Event, Program, Session, PartnerLogo, Inquiry, Resource
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline, TranslationTabularInline

# Create a new class that inherits from both NestedTabularInline and TranslationTabularInline
class TranslationNestedTabularInline(TranslationTabularInline, nested_admin.NestedTabularInline):
    pass

# Register your models here.

class InquiryInline(nested_admin.NestedTabularInline):
    model = Inquiry
    extra = 0
    fields = ('inquiry', 'role', 'email', 'order')
    readonly_fields = ('author', 'updated_by')

class SessionInline(TranslationStackedInline):
    model = Session
    extra = 0
    fields = ('session_title', 'session_details', 'venue', 'start_time', 'end_time', 'order')
    readonly_fields = ('author', 'updated_by')

class ProgramInline(TranslationNestedTabularInline):  # Use the new class here
    model = Program
    extra = 0
    fields = ('date', 'program_details', 'order')
    readonly_fields = ('author', 'updated_by')
    inlines = [SessionInline]

class PartnerLogoInline(TranslationNestedTabularInline):  # And here
    model = PartnerLogo
    extra = 0
    fields = ('name', 'partner_logo', 'order')
    readonly_fields = ('author', 'updated_by')

class ResourceInline(TranslationNestedTabularInline):  # And here
    model = Resource
    extra = 0
    fields = ('title', 'link', 'resource', 'order')
    readonly_fields = ('author', 'updated_by')

@admin.register(Event)
class EventAdmin(TranslationAdmin, nested_admin.NestedModelAdmin):
    model = Event
    fields = ('title', 'title_subtext', 'start_date', 'end_date', 'start_time', 'end_time', 'website_category', 'registration_link',
              'event_tag', 'event_image', 'background_image', 'location_name', 'location_link', 'event_details', 'order', 'author', 'updated_by')
    readonly_fields = ('id', 'author', 'created', 'updated_by', 'modified')
    list_display = ('title', 'start_date', 'event_tag', 'website_category', 'author')
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
