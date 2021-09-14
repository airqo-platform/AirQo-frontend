from django.db import models
from cloudinary.models import CloudinaryField


class Member(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    about = models.TextField(blank=True)
    picture = CloudinaryField("Image", overwrite=True, resource_type="image")

    def __str__(self):
        return self.name
