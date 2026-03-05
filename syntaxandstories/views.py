from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Post, Comment, Like

# Create your views here.


def home(request):
    return render(request, 'syntaxandstories/index.html')

def feed(request):
    # posts = Post.objects.all().prefetch_related('comments', 'likes').order_by('-created_at')
    pass
    return render(request, 'syntaxandstories/feed.html')

def toggle_like(request, post_id):
    """
    Toggle the like status of a post for the authenticated user.
    This view handles POST requests to like or unlike a post. If the user hasn't
    liked the post before, a new Like object is created. If the user has already
    liked the post, the existing Like object is deleted (unlike action).
    Args:
        request (HttpRequest): The HTTP request object containing the authenticated user.
        post_id (int): The ID of the post to toggle the like status for.
    Returns:
        JsonResponse: A JSON response containing:
            - liker (bool): True if the post was liked, False if unliked.
    Raises:
        Http404: If the post with the given post_id does not exist.
    Note:
        Requires the user to be authenticated. Only POST requests are processed.
    """
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)

        
        like, created = Like.objects.get_or_create(
            user=request.user,
            post=post
        )

        if created:
            liked = True

        else:
            like.delete()
            liked

        likes_count = post.likes.count()

        return JsonResponse({
            'liked':liked,
            'likes_count':likes_count
        })

