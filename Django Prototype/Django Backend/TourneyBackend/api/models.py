from django.db import models
from django.db.models.deletion import CASCADE, PROTECT, SET_NULL
from django.db.models.fields import CharField, DateTimeField, FloatField, IntegerField, PositiveIntegerField, EmailField, DecimalField, PositiveSmallIntegerField, TextField
from django.db.models.fields.related import ForeignKey, ManyToManyField
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.

#Notes
#One User can belong to multiple teams - ManyToMany
#One Team has multiple Users - ManyToMany
#One User can only be one host - OneToOne
#One Host can host multiple Tourneys - OneToMany
#Multiple Users can attend one tourney - ManyToOne




class Team(models.Model):
    team_name = CharField(max_length=50)
    team_leader = CharField(max_length=50, null=True, blank=True)
    team_logo = models.ImageField(default='team_default.png', upload_to='team_logos')
    tourneys_played = PositiveIntegerField(default=0)
    tourneys_won = PositiveIntegerField(default=0)
    tourneys_lost = PositiveIntegerField(default=0)
    games_played = PositiveIntegerField(default=0)
    games_won = PositiveIntegerField(default=0)
    games_lost = PositiveIntegerField(default=0)
    goals_for = PositiveIntegerField(default=0)
    goals_against = PositiveIntegerField(default=0)
    shots = PositiveIntegerField(default=0)
    saves = PositiveIntegerField(default=0)
    shutouts = PositiveIntegerField(default=0)

    def __str__(self):
        return f'Team: {self.team_name}'

#Basic Profile
class User(models.Model):
    GENDER = (
        ('mens', 'Mens'),
        ('womens', 'Womens')
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
    team = ManyToManyField(Team, blank=True, null=True) #Link Users to Teams
    points = PositiveIntegerField(default=0)
    tourneys_played = PositiveIntegerField(default=0)
    tourneys_won = PositiveIntegerField(default=0)
    tourneys_lost = PositiveIntegerField(default=0)
    games_played = PositiveIntegerField(default=0)
    games_won = PositiveIntegerField(default=0)
    games_lost = PositiveIntegerField(default=0)
    goals_for = PositiveIntegerField(default=0)
    goals_against = PositiveIntegerField(default=0)
    shots = PositiveIntegerField(default=0)
    saves = PositiveIntegerField(default=0)
    shutouts = PositiveIntegerField(default=0)
    

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
    AGEGROUPS = (
        ('youth', 'Youth'),
        ('preteen', 'Pre-teen'),
        ('teen', 'Teen'),
        ('youngadult', 'Young Adult'),
        ('adult', 'Adult'),
        ('mixed', 'Mixed')
    )
    

    name = CharField(max_length=50, blank=True, null=True)
    city = CharField(max_length=200, blank=True, null=True)
    lat_coord = FloatField(null=True, blank=True)
    lon_coord = FloatField(null=True, blank=True)
    host = ForeignKey(Host, blank=True, null=True, on_delete=CASCADE) #Link Tourney to Host
    team_size = CharField(max_length=10, null=True, blank=True, choices=TEAMSIZES)
    gender = CharField(max_length=20, choices=GENDER, default='Mens')
    duration_points = IntegerField(default=3, validators=[MinValueValidator(3),MaxValueValidator(10)])
    current_participants = ManyToManyField(Team, blank=True, null=True)
    max_participants = PositiveIntegerField(default=32, validators=[MinValueValidator(6),MaxValueValidator(64)])
    age_group = CharField(max_length=50, default='Mixed', choices=AGEGROUPS)
    entry_fee = PositiveIntegerField(default=10, validators=[MinValueValidator(5), MaxValueValidator(150)])
    photo = models.ImageField(default='default_field.png', upload_to='venue_pics/')

    def __str__(self):
        return f'{self.name} Tournament'

class Transaction(models.Model):
    DIRECTION = (
        ('buy', 'Buy'),
        ('earn', 'Earn')
    )

    price = DecimalField(max_digits=100, decimal_places=2, default=0)
    direction = CharField(max_length=50, choices=DIRECTION)
    timestamp = DateTimeField(auto_now=True)
    venue = ForeignKey(Tourney, blank=True, null=True, on_delete=models.PROTECT)
    account = ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f'{self.account.first_name} {self.account.last_name} Transaction {self.timestamp}'

class Game(models.Model):
    timestamp = DateTimeField(auto_now=True)
    teams = ManyToManyField(Team,blank=True, null=True)
    winner = CharField(max_length=50, blank=True, null=True)
    loser = CharField(max_length=50, blank=True, null=True)
    winner_points = PositiveIntegerField(default=0)
    loser_points = PositiveIntegerField(default=0)
    winner_scorers = CharField(max_length=50, blank=True, null=True)
    loser_scorers = CharField(max_length=50, blank=True, null=True)
    venue = ForeignKey(Tourney, blank=True, null=True, on_delete=PROTECT)

    def __str__(self):
        return f'Match at {self.timestamp} at {self.venue}'