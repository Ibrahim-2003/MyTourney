from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import CharField, BooleanField, EmailField, PositiveSmallIntegerField, TextField
from django.db.models.fields.related import ForeignKey

# Create your models here.

#Link Users to Teams
class Teams(models.Model):
    team_name = CharField(max_length=50)
    team_logo = models.ImageField(default='team_default.png', upload_to='team_logos')

#Basic Profile
class User(models.Model):
    first_name = CharField(max_length=30)
    last_name = CharField(max_length=30)
    email = EmailField()
    username = CharField(max_length=50)
    password = CharField(max_length=50)
    gender = BooleanField() #True for men, False for women
    age = PositiveSmallIntegerField()
    bio = TextField(max_length=300)
    photo = models.ImageField(default='default_profile.png', upload_to='profile_pics/')
    team = models.ManyToManyField(Teams, blank=True, null=True, on_delete=CASCADE)

    def __str__(self):
        return f'{self.first_name} {self.last_name} Profile'

class Host(models.Model):
    host = ForeignKey(User, blank=True, null=True, on_delete=CASCADE)
    address = CharField(max_length=200)

class Tourney(models.Model):
    host = ForeignKey(Host, blank=True, null=True, on_delete=CASCADE)