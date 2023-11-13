from django.db import models
from backend.utils.models import BaseModel
from author.decorators import with_author

# Create your models here.
@with_author
class CleanAirResource(BaseModel):
    resource_title =  models.CharField(max_length=120)
    resource_link = models.URLField(null=True, blank=True)
    resource_file = models.FileField(upload_to='cleanair/resources/', null=True, blank=True)
    author_title = models.CharField(max_length=40, null=True, blank=True, default="Created By")

    class ResourceCategory(models.TextChoices):
        ToolKit = "toolkit", "ToolKit"
        TechnicalReport = "technical_report", "Technical Report"
        WorkshopReport = "workshop_report", "Workshop Report"
        ResearchPublication = "research_publication", "Research Publication"

    resource_category = models.CharField(
        max_length=40, default=ResourceCategory.TechnicalReport, choices=ResourceCategory.choices, null=False, blank=False
    )
    resource_authors = models.CharField(max_length=200, default="AirQo")
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.resource_title