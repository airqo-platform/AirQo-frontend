# Generated by Django 5.0.2 on 2024-02-13 00:44

import django_quill.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0006_event_website_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='event_details_en',
            field=django_quill.fields.QuillField(null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='event_details_fr',
            field=django_quill.fields.QuillField(null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='location_name_en',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='location_name_fr',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='title_en',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='title_fr',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='title_subtext_en',
            field=models.CharField(max_length=90, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='title_subtext_fr',
            field=models.CharField(max_length=90, null=True),
        ),
        migrations.AddField(
            model_name='partnerlogo',
            name='name_en',
            field=models.CharField(max_length=70, null=True),
        ),
        migrations.AddField(
            model_name='partnerlogo',
            name='name_fr',
            field=models.CharField(max_length=70, null=True),
        ),
        migrations.AddField(
            model_name='program',
            name='program_details_en',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='program',
            name='program_details_fr',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='resource',
            name='title_en',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='resource',
            name='title_fr',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='session',
            name='session_details_en',
            field=django_quill.fields.QuillField(null=True),
        ),
        migrations.AddField(
            model_name='session',
            name='session_details_fr',
            field=django_quill.fields.QuillField(null=True),
        ),
        migrations.AddField(
            model_name='session',
            name='session_title_en',
            field=models.CharField(max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='session',
            name='session_title_fr',
            field=models.CharField(max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='session',
            name='venue_en',
            field=models.CharField(blank=True, max_length=80, null=True),
        ),
        migrations.AddField(
            model_name='session',
            name='venue_fr',
            field=models.CharField(blank=True, max_length=80, null=True),
        ),
    ]
