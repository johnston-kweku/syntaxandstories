from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db import transaction
from django.db.models import Count, Prefetch, F, Exists, OuterRef
from .models import Post, Comment, Like, SavedPosts
from user.models import Follow

# Create your views here.


def home(request):
    return render(request, 'syntaxandstories/index.html')

@login_required
def feed(request):
    following_ids = Follow.objects.filter(
        follower=request.user
    ).values_list('following_id', flat=True)

    following_ids = list(following_ids) + [request.user.id]


    follow_subquery = Follow.objects.filter(
        follower=request.user,
        following=OuterRef('author')
    )



    user_saves_prefetch = Prefetch(
    "saved_by",
    queryset=SavedPosts.objects.filter(user=request.user),
    to_attr="user_saved"
)

    user_likes_prefetch = Prefetch(
        'likes',
        queryset=Like.objects.filter(user=request.user),
        to_attr='user_liked'
    )

    posts = (
        Post.objects.filter(author_id__in=following_ids)
        .select_related('author')
        .prefetch_related('comments', user_likes_prefetch, user_saves_prefetch)
        .annotate(
            comments_count=Count('comments', distinct=True),
            author_is_followed=Exists(follow_subquery)
        )
        .order_by("-created_at")
    )

    context = {
        'posts':posts
    }

    return render(request, 'syntaxandstories/feed.html', context)

@login_required
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

        with transaction.atomic():
            like, created = Like.objects.get_or_create(
                user=request.user,
                post=post
            )

            if created:
                liked = True
                Post.objects.filter(id=post.id).update(likes_count=F('likes_count') + 1)

            else:
                like.delete()
                liked = False
                Post.objects.filter(id=post.id).update(likes_count=F('likes_count') - 1)

            post.refresh_from_db()


        return JsonResponse({
            'liked':liked,
            'likes_count':post.likes_count
        })

@login_required
def save_post(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)

        with transaction.atomic():
            save, created = SavedPosts.objects.get_or_create(
                user=request.user,
                post=post
            )
            
            if created:
                saved = True
                Post.objects.filter(id=post.id).update(saves_count=F('saves_count') + 1)
            else:
                save.delete()
                saved = False
                Post.objects.filter(id=post.id).update(saves_count=F('saves_count') - 1)
        
            post.refresh_from_db()

        
        return JsonResponse({
            'saved':saved,
            'saves_count':post.saves_count
        })

            
