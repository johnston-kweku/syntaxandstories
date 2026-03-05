from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Post, Comment, Like

# Create your views here.


def home(request):
    return render(request, 'syntaxandstories/index.html')

def feed(request):
    # posts = Post.objects.all().prefetch_related('comments', 'likes').order_by('-created_at')
    pass
    return render(request, 'syntaxandstories/feed.html')