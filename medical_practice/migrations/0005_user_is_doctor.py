# Generated by Django 4.1.6 on 2023-04-21 17:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medical_practice', '0004_alter_doctor_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_doctor',
            field=models.BooleanField(default=True),
        ),
    ]
