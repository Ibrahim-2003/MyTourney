from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import CharField, BooleanField, EmailField, PositiveSmallIntegerField, TextField
from django.db.models.fields.related import ForeignKey

# Create your models here.

#Link Users to Teams
class Team(models.Model):
    team_name = CharField(max_length=50)
    team_logo = models.ImageField(default='team_default.png', upload_to='team_logos')

#Basic Profile
#Shell Script
#u = User(first_name="Ahmad", last_name="Shady", email="ahmad.shady@gmail.com", username="user", password="1234", gender=True, age=27, bio="Great player from Masr", photo="profile_pics/default_profile.png")
class User(models.Model):
    GENDER = (
        ("Mens", "Mens"),
        ("Womens", "Womens")
        )

    first_name = CharField(max_length=30)
    last_name = CharField(max_length=30)
    email = EmailField()
    username = CharField(max_length=50)
    password = CharField(max_length=50)
    gender = CharField(max_length=20, choices=GENDER, default='Mens')
    age = PositiveSmallIntegerField()
    bio = TextField(max_length=300)
    photo = models.ImageField(default='default_profile.png', upload_to='profile_pics/')
    team = models.ManyToManyField(Team, blank=True, null=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name} Profile'

class Host(models.Model):
    user = ForeignKey(User, blank=True, null=True, on_delete=CASCADE)
    address = CharField(max_length=200)

class Tourney(models.Model):
    host = ForeignKey(Host, blank=True, null=True, on_delete=CASCADE)