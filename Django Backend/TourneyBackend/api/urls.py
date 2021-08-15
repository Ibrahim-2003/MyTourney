
from django.urls import path
from .views import Index
from . import views

urlpatterns = [
    path('', Index),
    path('users/', views.UserView.as_view(), name = 'users_list'),
    path('users/<int:pk>/', views.userDetails),
    path('teams/', views.TeamView.as_view(), name = 'teams_list'),
    path('teams/<int:pk>/', views.teamDetails),
    path('hosts/', views.HostView.as_view(), name = 'hosts_list'),
    path('hosts/<int:pk>', views.hostDetails),
]
