# Generated by Django 4.1.7 on 2023-10-23 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('partners', '0006_alter_partner_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partner',
            name='type',
            field=models.CharField(blank=True, choices=[('partnership', 'Partnership'), ('collaboration', 'Collaboration'), ('policy', 'Policy'), ('funder', 'Funder'), ('research', 'Research'), ('network', 'Clean air Network Partner'), ('support', 'Clean air Supporting Partner'), ('forum', 'Clean air policy forum')], default='partnership', max_length=40, null=True),
        ),
    ]
