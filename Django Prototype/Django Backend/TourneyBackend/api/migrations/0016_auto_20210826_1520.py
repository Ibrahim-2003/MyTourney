# Generated by Django 3.2.5 on 2021-08-26 15:20

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_auto_20210813_1020'),
    ]

    operations = [
        migrations.AddField(
            model_name='tourney',
            name='entry_fee',
            field=models.PositiveIntegerField(default=10, validators=[django.core.validators.MinValueValidator(5), django.core.validators.MaxValueValidator(150)]),
        ),
        migrations.AddField(
            model_name='tourney',
            name='photo',
            field=models.ImageField(default='default_field.png', upload_to='venue_pics/'),
        ),
    ]