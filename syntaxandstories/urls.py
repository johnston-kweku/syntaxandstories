from django.urls import path
from . import views


app_name = 'syntaxandstories'
urlpatterns = [
    path('', views.home, name='home'),
    path('feed/', views.feed, name='feed'),
]