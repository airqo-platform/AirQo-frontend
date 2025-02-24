from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(FAQ)
class FAQTranslationOptions(TranslationOptions):
    fields = ('question', 'answer',)
