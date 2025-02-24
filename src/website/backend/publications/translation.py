from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(Publication)
class PublicationTranslationOptions(TranslationOptions):
    fields = ('title', 'authors', 'link_title',)
