from author.decorators import with_author
from django.db import models
from cloudinary.models import CloudinaryField
from backend.utils.models import BaseModel

@with_author
class Publication(BaseModel):
    class CategoryTypes(models.TextChoices):
        Research = "research", "Research"
        Technical = "technical", "Technical"
        Policy = "policy", "Policy"

    title = models.CharField(max_length=255)
    authors = models.TextField(null=True, blank=True)
    link = models.URLField(null=True, blank=True)
    link_title = models.CharField(max_length=100, default="Read More", null=True, blank=True)
    category = models.CharField(
        max_length=40, default=CategoryTypes.Research, choices=CategoryTypes.choices, null=True, blank=True
    )
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.id
