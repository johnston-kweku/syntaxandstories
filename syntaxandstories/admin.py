from django.contrib import admin
from .models import Post, Comment, Like, Post_tags

# Register your models here.

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'media', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    list_filter = ('created_at',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
    search_fields = ('content', 'author__username', 'post__title')
    list_filter = ('created_at',)

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'user')
    search_fields = ('user__username', 'post__title')


@admin.register(Post_tags)
class TagAdmin(admin.ModelAdmin):
    list_display = ('tag', 'post')



