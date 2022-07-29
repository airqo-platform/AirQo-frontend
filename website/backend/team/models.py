from author.decorators import with_author
from django.db import models
from cloudinary.models import CloudinaryField
from backend.utils.models import BaseModel


@with_author
class Member(BaseModel):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    about = models.TextField(blank=True)
    picture = CloudinaryField("Image", overwrite=True, resource_type="image")
    twitter = models.URLField(max_length=255, null=True, blank=True)
    linked_in = models.URLField(max_length=255, null=True, blank=True)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name
