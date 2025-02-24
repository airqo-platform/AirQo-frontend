from django.db import models
from backend.utils.models import BaseModel
from author.decorators import with_author
from cloudinary.models import CloudinaryField


@with_author
class Press(BaseModel):
    article_title = models.CharField(max_length=100)
    article_intro = models.CharField(max_length=200, null=True, blank=True)
    article_link = models.URLField(null=True, blank=True)
    date_published = models.DateField()
    publisher_logo = CloudinaryField(
        "PublisherLogo", overwrite=True, resource_type="image", null=True, blank=True)
    order = models.IntegerField(default=1)

    class WebsiteCategory(models.TextChoices):
        AirQo = "airqo", "AirQo"
        CleanAir = "cleanair", "CleanAir"

    website_category = models.CharField(
        max_length=40, default=WebsiteCategory.AirQo, choices=WebsiteCategory.choices, null=True, blank=True
    )

    class ArticleTag(models.TextChoices):
        Untagged = "none", "None"
        Featured = "featured", "Featured"

    article_tag = models.CharField(
        max_length=40, default=ArticleTag.Untagged, choices=ArticleTag.choices, null=True, blank=True
    )

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.article_title
