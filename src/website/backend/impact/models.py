from django.db import models
from author.decorators import with_author
from backend.utils.models import BaseModel

# Create your models here.
@with_author
class ImpactNumber(BaseModel):
    african_cities = models.IntegerField(default=8)
    champions = models.IntegerField(default=1500)
    deployed_monitors =  models.IntegerField(default=200)
    data_records = models.IntegerField(default=67)
    research_papers = models.IntegerField(default=10)
    partners =  models.IntegerField(default=300)

    def save(self, *args, **kwargs):
        if not self.pk and ImpactNumber.objects.exists():
            # If the model instance already exists, update it instead of creating a new entry
            instance = ImpactNumber.objects.first()
            instance.african_cities = self.african_cities
            instance.champions = self.champions
            instance.deployed_monitors = self.deployed_monitors
            instance.data_records = self.data_records
            instance.research_papers = self.research_papers
            instance.partners = self.partners
            instance.save()
            return instance
        return super().save(*args, **kwargs)

    class Meta:
        app_label = 'impact'