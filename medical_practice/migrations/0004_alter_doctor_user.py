# Generated by Django 4.1.6 on 2023-04-21 09:48

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('medical_practice', '0003_alter_doctor_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctor',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='doctor', to=settings.AUTH_USER_MODEL),
        ),
    ]