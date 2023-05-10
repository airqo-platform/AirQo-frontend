from django.contrib import admin
import nested_admin
from .models import AfricanCountry, City, Content, Image

# Register your models here.
class ImageInline(nested_admin.NestedTabularInline):
    fields = ('image', 'order')
    readonly_fields = ('author', 'updated_by')
    model = Image
    extra = 0

    def count_images(self):
        entries = self.model.objects.count()
        if entries >= 4:
            return False
        else:
            return True

class ContentInline(nested_admin.NestedStackedInline):
    fields = ('title','description','order')
    readonly_fields = ('author', 'updated_by')
    model = Content
    extra = 0
    inlines = (ImageInline,)

class CityInline(nested_admin.NestedTabularInline):
    fields = ('city_name','order')
    readonly_fields = ('author', 'updated_by')
    model = City
    extra = 0
    inlines = (ContentInline,)


@admin.register(AfricanCountry)
class AfricanCitiesAdmin(nested_admin.NestedModelAdmin):
    fields = ('country_name', 'country_flag','order','author', 'updated_by')
    readonly_fields = ('id', 'author', 'created', 'updated_by', 'modified')
    list_display=('country_name','country_flag','order','author')
    search_fields =('country_name','author')
    list_filter = ('created',)
    inlines = (CityInline,)
    list_per_page = 10

    def response_add(self, request, obj, post_url_continue=None):
        res = super().response_add(request, obj, post_url_continue=post_url_continue)
        if res.status_code == 302 and '_continue' in request.POST:
            res['Location'] = request.path
        return res