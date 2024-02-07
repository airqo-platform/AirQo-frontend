from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(Event)
class EventTranslationOptions(TranslationOptions):
    fields = (
        "title",
        "title_subtext",
        "location_name",
        "event_details",
    )


@register(Inquiry)
class InquiryTranslationOptions(TranslationOptions):
    fields = ("inquiry",)


@register(Program)
class ProgramTranslationOptions(TranslationOptions):
    fields = ("program_details",)


@register(Session)
class SessionTranslationOptions(TranslationOptions):
    fields = ("venue", "session_title", "session_details",)


@register(PartnerLogo)
class PartnerLogoTranslationOptions(TranslationOptions):
    fields = ("name",)


@register(Resource)
class ResourceTranslationOptions(TranslationOptions):
    fields = ("title",)
