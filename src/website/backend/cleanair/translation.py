from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(CleanAirResource)
class CleanAirResourceTranslationOptions(TranslationOptions):
    fields = ('resource_title', 'author_title', 'resource_authors',)
