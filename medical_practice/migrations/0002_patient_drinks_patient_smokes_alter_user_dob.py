# Generated by Django 4.1.6 on 2023-04-21 02:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medical_practice', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='drinks',
            field=models.CharField(blank=True, choices=[('1', 'Yes'), ('2', 'No'), ('3', 'Used to')], max_length=10),
        ),
        migrations.AddField(
            model_name='patient',
            name='smokes',
            field=models.CharField(blank=True, choices=[('1', 'Yes'), ('2', 'No'), ('3', 'Used to')], max_length=10),
        ),
        migrations.AlterField(
            model_name='user',
            name='dob',
            field=models.DateField(max_length=8),
        ),
    ]
