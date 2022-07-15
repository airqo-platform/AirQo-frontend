from django.db import models
from django_extensions.db.models import TimeStampedModel
from cloudinary.models import CloudinaryField
from author.decorators import with_author

# Create your models here.
@with_author
class Tag(models.Model):
    name = models.CharField(max_length=20)

@with_author
class Highlight(TimeStampedModel):
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag)
    image = CloudinaryField("Image", overwrite=True, resource_type="image")
    link = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
