# Generated by Django 4.1.7 on 2023-09-12 08:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('press', '0003_press_website_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='press',
            name='article_tag',
            field=models.CharField(blank=True, choices=[('none', 'None'), ('featured', 'Featured')], default='none', max_length=40, null=True),
        ),
    ]