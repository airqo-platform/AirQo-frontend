from django.db import models
from author.decorators import with_author
from cloudinary.models import CloudinaryField
from django_quill.fields import QuillField

from backend.utils.models import BaseModel

# Create your models here.
@with_author
class AfricanCountry(BaseModel):
    country_name = models.CharField(max_length=100)
    country_flag = CloudinaryField("CountryFlag", overwrite=True, resource_type="image")
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.country_name

@with_author
class City(BaseModel):
    city_name = models.CharField(max_length=100)
    order = models.IntegerField(default=1)
    african_city = models.ForeignKey(
        AfricanCountry,
        null=True,
        related_name="city",
        on_delete=models.deletion.SET_NULL,
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.city_name

@with_author
class Content(BaseModel):
    title = models.CharField(max_length=150)
    description = QuillField()
    order = models.IntegerField(default=1)
    city = models.ForeignKey(
        City,
        null=True,
        related_name="content",
        on_delete=models.deletion.SET_NULL,
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.id

@with_author
class Image(BaseModel):
    image = CloudinaryField("ContentImage", overwrite=True, resource_type="image")
    order = models.IntegerField(default=1)
    content = models.ForeignKey(
        Content,
        null=True,
        blank=True,
        related_name="image",
        on_delete=models.deletion.SET_NULL,
    )

    class Meta:
        ordering = ['order']
