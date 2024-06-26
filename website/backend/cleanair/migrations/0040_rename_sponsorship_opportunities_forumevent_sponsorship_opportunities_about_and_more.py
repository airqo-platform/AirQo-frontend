# Generated by Django 5.0.2 on 2024-05-02 00:06

import django_quill.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0039_rename_sponsorship_details_forumevent_sponsorship_opportunities_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='forumevent',
            old_name='sponsorship_opportunities',
            new_name='sponsorship_opportunities_about',
        ),
        migrations.AddField(
            model_name='forumevent',
            name='sponsorship_opportunities_schedule',
            field=django_quill.fields.QuillField(blank=True, null=True),
        ),
    ]
