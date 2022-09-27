from author.decorators import with_author
from django.db import models
from cloudinary.models import CloudinaryField
from django.db.models.signals import pre_save
from django.dispatch import receiver

from backend.utils.models import BaseModel

@with_author
class Partner(BaseModel):
    class RelationTypes(models.TextChoices):
        Partnership = "partnership", "Partnership"
        Collaboration = "collaboration", "Collaboration"
        Policy = "policy", "Policy"

    partner_image = CloudinaryField("PartnerImage", overwrite=True, resource_type="image", null=True, blank=True)
    partner_logo = CloudinaryField("PartnerLogo", overwrite=True, resource_type="image")
    partner_name = models.CharField(max_length=200, null=False, blank=False)
    order = models.IntegerField(default=1)
    partner_link = models.URLField(null=True, blank=True)
    unique_title = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(
        max_length=40, default=RelationTypes.Partnership, choices=RelationTypes.choices, null=True, blank=True
    )

    class Meta:
        ordering = ['order', 'id']

    def generate_unique_title(self, postfix_index=0):
        from django.utils.text import slugify

        unique_title = slugify(self.partner_name)

        if postfix_index > 0:
            unique_title = f"{unique_title}{postfix_index}"
        try:
            Partner.objects.get(unique_title=unique_title)
        except Partner.DoesNotExist:
            return unique_title
        else:
            postfix_index += 1
            return self.generate_unique_title(postfix_index=postfix_index)

    def __str__(self):
        return f"Partner - {self.partner_name}"


@receiver(pre_save, dispatch_uid="append_short_name", sender=Partner)
def append_short_name(sender, instance, *args, **kwargs):
    if not instance.unique_title:
        instance.unique_title = instance.generate_unique_title()


@with_author
class PartnerDescription(BaseModel):
    description = models.TextField(null=True, blank=True)
    order = models.IntegerField(default=1)
    partner = models.ForeignKey(
        Partner,
        null=True,
        blank=True,
        related_name="descriptions",
        on_delete=models.deletion.SET_NULL,
    )

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Description {self.id}"
