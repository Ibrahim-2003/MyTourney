from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import CharField, DateTimeField, PositiveIntegerField, EmailField, DecimalField, PositiveSmallIntegerField, TextField
from django.db.models.fields.related import ForeignKey

# Create your models here.

#Notes
#One User can belong to multiple teams - ManyToMany
#One Team has multiple Users - ManyToMany
#One User can only be one host - OneToOne
#One Host can host multiple Tourneys - OneToMany
#Multiple Users can attend one tourney - ManyToOne



class Team(models.Model):
    team_name = CharField(max_length=50)
    team_logo = models.ImageField(default='team_default.png', upload_to='team_logos')
    tourneys_played = PositiveIntegerField(default=0)
    tourneys_won = PositiveIntegerField(default=0)
    tourneys_lost = PositiveIntegerField(default=0)
    games_played = PositiveIntegerField(default=0)
    games_won = PositiveIntegerField(default=0)
    games_lost = PositiveIntegerField(default=0)
    goals_for = PositiveIntegerField(default=0)
    goals_against = PositiveIntegerField(default=0)
    strikes = PositiveIntegerField(default=0)
    saves = PositiveIntegerField(default=0)    

    def __str__(self):
        return f'Team: {self.team_name}'

#Basic Profile
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
    team = models.ManyToManyField(Team, blank=True, null=True) #Link Users to Teams

    def __str__(self):
        return f'{self.first_name} {self.last_name} Profile'

class Host(models.Model):
    MEMBERSHIP = (
        ('free', 'Free'),
        ('certified', 'Certified')
    )

    user = ForeignKey(User, blank=True, null=True, on_delete=CASCADE) #Link Host to User
    address = CharField(max_length=200)
    membership = CharField(max_length=50, choices=MEMBERSHIP, default='free')

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} Host'

class Tourney(models.Model):
    TEAMSIZES = (
        ('3v3','3v3'),
        ('4v4','4v4'),
        ('5v5','5v5'),
        ('6v6','6v6'),
        ('7v7','7v7'),
        ('8v8','8v8'),
        ('9v9','9v9'),
        ('10v10','10v10'),
        ('11v11','11v11'),
    )
    GENDER = (
        ("Mens", "Mens"),
        ("Womens", "Womens")
        )

    host = ForeignKey(Host, blank=True, null=True, on_delete=CASCADE) #Link Tourney to Host
    team_size = CharField(max_length=10, null=True, blank=True, choices=TEAMSIZES)
    gender = CharField(max_length=20, choices=GENDER, default='Mens')

class Transaction(models.Model):
    DIRECTION = (
        ('buy', 'Buy'),
        ('earn', 'Earn')
    )

    price = DecimalField(max_digits=None, decimal_places=2, default=0.00)
    direction = CharField(max_length=50, choices=DIRECTION)
    timestamp = DateTimeField(auto_now=True)
    venue = ForeignKey(Tourney, blank=True, null=True, on_delete=models.SET_NULL)
    account = ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)