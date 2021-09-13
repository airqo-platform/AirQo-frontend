from django.db import models


class Team(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    about = models.TextField(blank=True)

    def __str__(self):
        return self.name
