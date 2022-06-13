from author.decorators import with_author
from django_extensions.db.models import TimeStampedModel
from django.db import models
from cloudinary.models import CloudinaryField


@with_author
class Member(TimeStampedModel):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    about = models.TextField(blank=True)
    picture = CloudinaryField("Image", overwrite=True, resource_type="image")
    twitter = models.URLField(max_length=255, null=True, blank=True)
    linked_in = models.URLField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name
