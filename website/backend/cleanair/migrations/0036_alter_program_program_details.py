# Generated by Django 5.0.2 on 2024-05-01 23:08

import django_quill.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0035_alter_program_program_details'),
    ]

    operations = [
        migrations.AlterField(
            model_name='program',
            name='program_details',
            field=django_quill.fields.QuillField(blank=True, null=True),
        ),
    ]