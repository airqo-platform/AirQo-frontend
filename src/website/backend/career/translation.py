from modeltranslation.translator import register, TranslationOptions
from .models import *


@register(Department)
class DepartmentTranslationOptions(TranslationOptions):
    fields = ('name',)


@register(Career)
class CareerTranslationOptions(TranslationOptions):
    fields = ('title',)


@register(JobDescription)
class JobDescriptionTranslationOptions(TranslationOptions):
    fields = ('description',)


@register(BulletDescription)
class BulletDescriptionTranslationOptions(TranslationOptions):
    fields = ('name',)


@register(BulletPoint)
class BulletPointTranslationOptions(TranslationOptions):
    fields = ('point',)
