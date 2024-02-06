from modeltranslation.translator import register, TranslationOptions, translator
from .models import Event, Inquiry, Program, Session, PartnerLogo, Resource


@register(Event)
class EventTranslationOptions(TranslationOptions):
    fields = (
        "title",
        "title_subtext",
        "location_name",
        "event_details",
    )


class InquiryTranslationOptions(TranslationOptions):
    fields = ("inquiry",)


translator.register(Inquiry, InquiryTranslationOptions)


class ProgramTranslationOptions(TranslationOptions):
    fields = ("program_details",)


translator.register(Program, ProgramTranslationOptions)


class SessionTranslationOptions(TranslationOptions):
    fields = ("venue", "session_title", "session_details",)


translator.register(Session, SessionTranslationOptions)


class PartnerLogoTranslationOptions(TranslationOptions):
    fields = ("name",)


translator.register(PartnerLogo, PartnerLogoTranslationOptions)


class ResourceTranslationOptions(TranslationOptions):
    fields = ("title",)


translator.register(Resource, ResourceTranslationOptions)
