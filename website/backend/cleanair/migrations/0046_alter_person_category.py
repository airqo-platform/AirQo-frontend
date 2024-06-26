# Generated by Django 5.0.2 on 2024-05-31 00:49

import backend.cleanair.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0045_forumevent_travel_logistics_accommodation_details'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='category',
            field=models.CharField(choices=[('Speaker', 'SPEAKER'), ('Committee Member', 'COMMITTEE_MEMBER'), ('Key Note Speaker', 'KEY_NOTE_SPEAKER'), ('Speaker and Committee Member', 'SPEAKER_AND_COMMITTEE_MEMBER'), ('All', 'ALL')], default=backend.cleanair.models.CategoryChoices['SPEAKER'], max_length=50),
        ),
    ]
