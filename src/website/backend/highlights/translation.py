from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(Tag)
class TagTranslationOptions(TranslationOptions):
    fields = ('name',)


@register(Highlight)
class HighlightTranslationOptions(TranslationOptions):
    fields = ('title', 'link_title',)
