# Generated by Django 4.2.2 on 2023-09-20 13:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cleanairresource',
            name='resource_file',
            field=models.FileField(blank=True, null=True, upload_to='cleanair/resources/'),
        ),
    ]
