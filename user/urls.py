from django.urls import path
from . import views
app_name = 'user'
urlpatterns = [
    path('sign_up/', views.sign_up, name='sign_up'),
    path('logout/', views.logout_view, name='logout'),
    path('login/', views.login_view, name='login'),
    path('profile/<str:username>/', views.profile_view, name='profile'),
    path('profile/edit/<str:username>/', views.edit_profile_view, name='edit_profile'),
    path('follow/<str:username>/', views.toggle_follow, name='follow'),
    path('settings/', views.settings_view, name='settings'),
    path('settings/privacy/', views.privacy_and_terms, name='privacy'),
    path('change/email/', views.change_email, name='change_email'),
    path('change/password/', views.change_password, name='change_password'),
    path('followers/list/', views.followers_list, name='followers_list'),
]