# Generated by Django 5.0.7 on 2024-08-12 07:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0053_remove_resourcefile_resource_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='resourcefile',
            options={'ordering': ['order', '-id']},
        ),
        migrations.AlterModelOptions(
            name='resourcesession',
            options={'ordering': ['order', '-id']},
        ),
        migrations.AddField(
            model_name='resourcefile',
            name='order',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='resourcesession',
            name='order',
            field=models.IntegerField(default=1),
        ),
    ]
