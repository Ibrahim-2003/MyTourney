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


class TeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        fields = ('id',
                'team_name',
                'team_leader',
                'team_logo',
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

class HostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Host
        fields = ('id',
                'user',
                'address',
                'membership')

class TourneySerializer(serializers.ModelSerializer):

    class Meta:
        model = Tourney
        fields = ('id',
                'name',
                'city',
                'lat_coord',
                'lon_coord',
                'host',
                'team_size',
                'gender',
                'duration_points',
                'current_participants',
                'max_participants',
                'age_group')

class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('id',
                'price',
                'direction',
                'timestamp',
                'venue',
                'account')

class GameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = ('id',
                'timestamp',
                'teams',
                'winner',
                'loser',
                'winner_points',
                'loser_points',
                'winner_scorers',
                'loser_scorers',
                'venue')