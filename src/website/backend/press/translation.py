from modeltranslation.translator import register, TranslationOptions
from .models import Press


@register(Press)
class PressTranslationOptions(TranslationOptions):
    fields = ('article_title', 'article_intro',)
