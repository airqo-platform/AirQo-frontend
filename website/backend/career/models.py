from author.decorators import with_author
from django.db import models
from django_extensions.db.models import TimeStampedModel
from django.db.models.signals import pre_save
from django.dispatch import receiver

from backend.utils.models import BaseModel


@with_author
class Department(BaseModel):
    name = models.CharField(max_length=30, null=False, blank=False)

    def __str__(self):
        return f"{self.name} Department"


@with_author
class Career(BaseModel):
    class JobTypes(models.TextChoices):
        FullTime = "full-time", "Full Time"
        PartTime = "part-time", "Part Time"
        Contract = "contract", "Contract"
        Temporary = "temporary", "Temporary"
        Internship = "internship", "Internship"
        GraduateTraining = "graduate-training", "Graduate Training"

    title = models.CharField(max_length=100)
    unique_title = models.CharField(max_length=100, null=True, blank=True)
    closing_date = models.DateTimeField()
    apply_url = models.URLField(max_length=250)
    type = models.CharField(
        max_length=30, default=JobTypes.FullTime, choices=JobTypes.choices
    )
    department = models.ForeignKey(
        Department,
        null=True,
        blank=True,
        related_name="careers",
        on_delete=models.deletion.SET_NULL,
    )

    def generate_unique_title(self, postfix_index=0):
        from django.utils.text import slugify

        unique_title = slugify(self.title)

        if postfix_index > 0:
            unique_title = f"{unique_title}{postfix_index}"
        try:
            Career.objects.get(unique_title=unique_title)
        except Career.DoesNotExist:
            return unique_title
        else:
            postfix_index += 1
            return self.generate_unique_title(postfix_index=postfix_index)

    def __str__(self):
        return f"Job - {self.title}"


@receiver(pre_save, dispatch_uid="append_short_name", sender=Career)
def append_short_name(sender, instance, *args, **kwargs):
    if not instance.unique_title:
        instance.unique_title = instance.generate_unique_title()


@with_author
class JobDescription(BaseModel):
    description = models.TextField()
    order = models.IntegerField(default=1)
    career = models.ForeignKey(
        Career,
        null=True,
        blank=True,
        related_name="descriptions",
        on_delete=models.deletion.SET_NULL,
    )

    def __str__(self):
        return f"JobDescription {self.id}"


@with_author
class BulletDescription(BaseModel):
    name = models.CharField(max_length=30)
    order = models.IntegerField(default=1)
    career = models.ForeignKey(
        Career,
        null=True,
        blank=True,
        related_name="bullets",
        on_delete=models.deletion.SET_NULL,
    )

    def __str__(self):
        return f"Bullet - {self.name}"


@with_author
class BulletPoint(BaseModel):
    point = models.TextField()
    order = models.IntegerField(default=1)
    bullet = models.ForeignKey(
        BulletDescription,
        null=True,
        blank=True,
        related_name="bullet_points",
        on_delete=models.deletion.SET_NULL,
    )

    def __str__(self):
        return f"BulletPoint - {self.id}"
