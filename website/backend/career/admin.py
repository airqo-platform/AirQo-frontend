from django.contrib import admin
import nested_admin
from .models import Department, Career, JobDescription, BulletDescription, BulletPoint


# Register your models here.
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    readonly_fields = ('id', 'author', 'updated_by')
    list_per_page = 10
    search_fields = ('id', 'name')

class JobDescriptionInline(nested_admin.NestedTabularInline):
    fields = ('description', 'order', 'author')
    readonly_fields = ('author', )
    model = JobDescription
    extra = 0

class BulletPointInline(nested_admin.NestedTabularInline):
    fields = ('point', 'order')
    model = BulletPoint
    extra = 0


class BulletDescriptionInline(nested_admin.NestedTabularInline):
    fields = ('name', 'order', 'author')
    readonly_fields = ('author',)
    model = BulletDescription
    inlines = (BulletPointInline, )
    extra = 0


@admin.register(Career)
class CareerAdmin(nested_admin.NestedModelAdmin):
    list_display = ('id', 'title', 'closing_date')
    readonly_fields = ('id', 'author', 'created', 'updated_by', 'modified')

    fields = ('id', "title", "department", "type", "apply_url", "closing_date", 'author', 'created', 'updated_by', 'modified')
    list_per_page = 10
    search_fields = ('title',)

    inlines = (JobDescriptionInline, BulletDescriptionInline)
