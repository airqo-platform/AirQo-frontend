from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(Partner)
class PartnerTranslationOptions(TranslationOptions):
    fields = ('partner_name',)


@register(PartnerDescription)
class PartnerDescriptionTranslationOptions(TranslationOptions):
    fields = ('description',)
