from django.db import models
from django_extensions.db.models import TimeStampedModel
from cloudinary.models import CloudinaryField
from author.decorators import with_author

from backend.utils.models import BaseModel

# Create your models here.
@with_author
class Tag(BaseModel):
    name = models.CharField(max_length=20, null=False, blank=False)

    def __str__(self):
        return self.name

@with_author
class Highlight(BaseModel):
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag)
    image = CloudinaryField("Image", overwrite=True, resource_type="image")
    link = models.URLField()
    link_title = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title
