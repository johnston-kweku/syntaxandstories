from django.urls import path
from . import views


app_name = 'syntaxandstories'
urlpatterns = [
    path('', views.home, name='home'),
    path('feed/', views.feed, name='feed'),
    path('like/<int:post_id>/', views.toggle_like, name='like'),
    path('save/<int:post_id>/', views.save_post, name='save_post'),
    path('post/<int:post_id>/comment/', views.add_comment, name='add_comment'),
    path('comment/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),
    path('create/post/', views.create_post, name='create_post')
]