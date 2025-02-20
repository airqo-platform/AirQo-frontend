from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(Member)
class MemberTranslationOptions(TranslationOptions):
    fields = ('name', 'title', 'about')


@register(MemberBiography)
class MemberBiographyTranslationOptions(TranslationOptions):
    fields = ('description',)
