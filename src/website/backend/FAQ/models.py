from django.db import models


class FAQ(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    question = models.CharField(max_length=150)
    answer = models.TextField()