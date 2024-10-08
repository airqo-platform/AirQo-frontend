# Generated by Django 5.0.7 on 2024-08-06 10:14

import django_quill.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0049_remove_forumresource_resource_file_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumresource',
            name='resource_file',
            field=models.FileField(blank=True, null=True, upload_to='cleanair/resources/'),
        ),
        migrations.AddField(
            model_name='forumresource',
            name='resource_summary',
            field=django_quill.fields.QuillField(blank=True, null=True),
        ),
        migrations.DeleteModel(
            name='ResourceFile',
        ),
    ]
