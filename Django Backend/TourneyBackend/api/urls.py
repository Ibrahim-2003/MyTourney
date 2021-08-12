
from django.urls import path
from .views import Index
from . import views

urlpatterns = [
    path('', Index),
    path('users/', views.UserView.as_view(), name= 'users_list'),
    path('users/<int:pk>/', views.UserDetails.as_view(), name='user_details'),
]
