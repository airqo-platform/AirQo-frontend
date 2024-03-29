# Generated by Django 4.1.7 on 2023-09-12 08:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CleanAirResource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name='modified')),
                ('is_deleted', models.BooleanField(default=False)),
                ('resource_title', models.CharField(max_length=100)),
                ('resource_link', models.URLField(blank=True, null=True)),
                ('resource_file', models.FileField(blank=True, null=True, upload_to='cleanair_resources/')),
                ('order', models.IntegerField(default=1)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cleanairresource_create', to=settings.AUTH_USER_MODEL, verbose_name='author')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cleanairresource_update', to=settings.AUTH_USER_MODEL, verbose_name='last updated by')),
            ],
            options={
                'ordering': ['order', '-id'],
            },
        ),
    ]
