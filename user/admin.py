from django.contrib import admin
from .models import UserProfile, Follow

# Register your models here.

@admin.register(UserProfile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'bio', 'location', 'link',
        ]


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = [
        'follower', 'following', 'created_at'
     ]
