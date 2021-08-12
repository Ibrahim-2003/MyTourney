from rest_framework import serializers
from .models import Team, Tourney, User, Host

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
                'team')
