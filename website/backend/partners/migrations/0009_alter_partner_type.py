# Generated by Django 4.1.7 on 2023-11-16 07:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('partners', '0008_alter_partner_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partner',
            name='type',
            field=models.CharField(blank=True, choices=[('partnership', 'Partnership'), ('collaboration', 'Collaboration'), ('policy', 'Policy'), ('funder', 'Funder'), ('research', 'Research'), ('ca-network', 'Clean air Network Partner'), ('ca-support', 'Clean air Supporting Partner'), ('ca-forum', 'Clean air Policy Forum'), ('ca-private-sector', 'Clean air private sector')], default='partnership', max_length=40, null=True),
        ),
    ]