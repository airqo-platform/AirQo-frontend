# Generated by Django 5.0.2 on 2024-04-09 20:11

import django_quill.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0025_person_section_text_alter_session_end_time'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='section_text',
        ),
        migrations.AddField(
            model_name='forumevent',
            name='Committee_text_section',
            field=django_quill.fields.QuillField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='forumevent',
            name='Speakers_text_section',
            field=django_quill.fields.QuillField(blank=True, null=True),
        ),
    ]