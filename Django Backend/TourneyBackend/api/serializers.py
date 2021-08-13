from rest_framework import serializers
from .models import Game, Team, Tourney, Transaction, User, Host

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 
                'first_name',
                'last_name',
                'email',
                'username',
                'password',
                'gender',
                'age',
                'bio',
                'photo',
                'team',
                'points',
                'tourneys_played',
                'tourneys_won',
                'tourneys_lost',
                'games_played',
                'games_won',
                'games_lost',
                'goals_for',
                'goals_against',
                'shots',
                'saves',
                'shutouts')
