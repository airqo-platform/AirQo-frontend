# Generated by Django 5.0.2 on 2024-04-08 18:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0023_person_bio_alter_person_biography'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='biography',
        ),
    ]
