# Generated by Django 3.2.6 on 2021-08-12 17:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_rename_teams_team'),
    ]

    operations = [
        migrations.RenameField(
            model_name='host',
            old_name='host',
            new_name='user',
        ),
    ]
