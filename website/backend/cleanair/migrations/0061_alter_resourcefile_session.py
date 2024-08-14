# Generated by Django 5.0.7 on 2024-08-12 08:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0060_alter_resourcesession_forum_resource'),
    ]

    operations = [
        migrations.AlterField(
            model_name='resourcefile',
            name='session',
            field=models.ForeignKey(blank=True, default=1, null=True, on_delete=django.db.models.deletion.CASCADE,
                                    related_name='resource_files', to='cleanair.resourcesession'),
        ),
    ]