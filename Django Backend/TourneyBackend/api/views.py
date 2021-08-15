from django.shortcuts import render, HttpResponse

# Create your views here.

def Index(request):
    return HttpResponse("It is working")

from .serializers import UserSerializer, TeamSerializer, TourneySerializer, TransactionSerializer, HostSerializer, GameSerializer
from .models import User, Team, Game, Host, Tourney, Transaction
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework import serializers, status
# Create your views here.

## User View

class UserView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.data)
        users_serializer = UserSerializer(data=request.data)
        if users_serializer.is_valid():
            users_serializer.save()
            return Response(users_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', users_serializer.errors)
            return Response(users_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE',])
def userDetails(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method=='GET':
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method=='PUT':
        data = JSONParser().parse(request)
        serializer = UserSerializer(user, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        user.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

## Team View

class TeamView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.data)
        teams_serializer = TeamSerializer(data=request.data)
        if teams_serializer.is_valid():
            teams_serializer.save()
            return Response(teams_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', teams_serializer.errors)
            return Response(teams_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE',])
def teamDetails(request, pk):
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method=='GET':
        serializer = TeamSerializer(team)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method=='PUT':
        data = JSONParser().parse(request)
        serializer = TeamSerializer(team, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        team.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)