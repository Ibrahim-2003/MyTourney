
from django.urls import path
from .views import Index
from . import views

#Transaction

urlpatterns = [
    path('', Index),
    path('users/', views.UserView.as_view(), name = 'users_list'),
    path('users/<int:pk>/', views.userDetails),
    path('teams/', views.TeamView.as_view(), name = 'teams_list'),
    path('teams/<int:pk>/', views.teamDetails),
    path('hosts/', views.HostView.as_view(), name = 'hosts_list'),
    path('hosts/<int:pk>/', views.hostDetails),
    path('tourneys/', views.TourneyView.as_view(), name = 'tourneys_list'),
    path('tourneys/<int:pk>/', views.tourneyDetails),
    path('games/', views.GameView.as_view(), name = 'games_list'),
    path('games/<int:pk>/', views.gameDetails),
    path('transactions/', views.TransactionView.as_view(), name = 'transactions_list'),
    path('transactions/<int:pk>/', views.transactionDetails),
]
