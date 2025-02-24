from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(BoardMember)
class BoardMemberTranslationOptions(TranslationOptions):
    fields = ('name', 'title')


@register(BoardMemberBiography)
class BoardMemberBiographyTranslationOptions(TranslationOptions):
    fields = ('description',)
