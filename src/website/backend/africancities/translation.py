from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(AfricanCountry)
class AfricanCountryTranslationOptions(TranslationOptions):
    fields = ('country_name',)


@register(City)
class CityTranslationOptions(TranslationOptions):
    fields = ('city_name',)


@register(Content)
class ContentTranslationOptions(TranslationOptions):
    fields = ('title',)


@register(Description)
class DescriptionTranslationOptions(TranslationOptions):
    fields = ('paragraph',)
