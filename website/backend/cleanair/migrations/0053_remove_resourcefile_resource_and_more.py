# Generated by Django 5.0.7 on 2024-08-12 07:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0052_resourcesession_resourcefile_session'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='resourcefile',
            name='resource',
        ),
        migrations.RemoveField(
            model_name='resourcesession',
            name='forum_event',
        ),
        migrations.AddField(
            model_name='resourcesession',
            name='forum_resource',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='resource_sessions', to='cleanair.forumresource'),
        ),
    ]
