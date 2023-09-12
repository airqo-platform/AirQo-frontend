from django.db import models
from backend.utils.models import BaseModel
from author.decorators import with_author

# Create your models here.
@with_author
class CleanAirResource(BaseModel):
    resource_title =  models.CharField(max_length=100)
    resource_link = models.URLField(null=True, blank=True)
    resource_file = models.FileField(upload_to='cleanair/resources/', null=True, blank=True)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.title