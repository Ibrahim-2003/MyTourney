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

## Host View

class HostView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        hosts = Host.objects.all()
        serializer = HostSerializer(hosts, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.data)
        hosts_serializer = HostSerializer(data=request.data)
        if hosts_serializer.is_valid():
            hosts_serializer.save()
            return Response(hosts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', hosts_serializer.errors)
            return Response(hosts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE',])
def hostDetails(request, pk):
    try:
        host = Host.objects.get(pk=pk)
    except Host.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method=='GET':
        serializer = HostSerializer(host)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method=='PUT':
        data = JSONParser().parse(request)
        serializer = HostSerializer(host, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        host.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

## Tourney View

class TourneyView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        tourneys = Tourney.objects.all()
        serializer = TourneySerializer(tourneys, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.data)
        tourneys_serializer = TourneySerializer(data=request.data)
        if tourneys_serializer.is_valid():
            tourneys_serializer.save()
            return Response(tourneys_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', tourneys_serializer.errors)
            return Response(tourneys_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE',])
def tourneyDetails(request, pk):
    try:
        tourney = Tourney.objects.get(pk=pk)
    except Tourney.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method=='GET':
        serializer = TourneySerializer(tourney)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method=='PUT':
        data = JSONParser().parse(request)
        serializer = TourneySerializer(tourney, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        tourney.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

## Game View

class GameView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        games = Game.objects.all()
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.data)
        games_serializer = GameSerializer(data=request.data)
        if games_serializer.is_valid():
            games_serializer.save()
            return Response(games_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', games_serializer.errors)
            return Response(games_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE',])
def gameDetails(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method=='GET':
        serializer = GameSerializer(game)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method=='PUT':
        data = JSONParser().parse(request)
        serializer = GameSerializer(game, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        game.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

## Transaction View

class TransactionView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        transactions = Transaction.objects.all()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.data)
        transactions_serializer = TransactionSerializer(data=request.data)
        if transactions_serializer.is_valid():
            transactions_serializer.save()
            return Response(transactions_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', transactions_serializer.errors)
            return Response(transactions_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE',])
def transactionDetails(request, pk):
    try:
        transaction = Transaction.objects.get(pk=pk)
    except Transaction.DoesNotExist:
        return HttpResponse(status=404)
    
    if request.method=='GET':
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method=='PUT':
        data = JSONParser().parse(request)
        serializer = TransactionSerializer(transaction, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        transaction.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)