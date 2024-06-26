# Generated by Django 4.1.7 on 2023-11-08 06:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cleanair', '0002_alter_cleanairresource_resource_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='cleanairresource',
            name='author_title',
            field=models.CharField(blank=True, default='Created By', max_length=40, null=True),
        ),
        migrations.AddField(
            model_name='cleanairresource',
            name='resource_category',
            field=models.CharField(choices=[('toolkit', 'ToolKit'), ('technical_report', 'Technical Report'), ('workshop_report', 'Workshop Report'), ('research_publication', 'Research Publication')], default='technical_report', max_length=40),
        ),
        migrations.AlterField(
            model_name='cleanairresource',
            name='resource_title',
            field=models.CharField(max_length=120),
        ),
    ]
