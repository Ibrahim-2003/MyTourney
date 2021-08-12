from rest_framework import serializers
from .models import Team, Tourney, User, Host

#One User can belong to multiple teams - ManyToMany
#One Team has multiple Users - ManyToMany
#One User can only be one host - OneToOne
#One Host can host multiple Tourneys - OneToMany
#Multiple Users can attend one tourney - ManyToOne

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

'''
from api.models import User
from api.serializers import UserSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
a = User(first_name="Ibrahim", last_name="Shady", email="ahmad.shady@gmail.com", username="user", password="1234", gender=True, age=27, bio="Great player from Masr", photo="profile_pics/default_profile.png")
a.save()
serializer = UserSerializer(a)
serializer.data
json = JSONRenderer().render(serializer.data)
json
import io
stream = io.BytesIO(json)
data = JSONParser().parse(stream)
data
serializer = UserSerializer(data=data)
serializer.is_valid()
'''