from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db import transaction
from django.db.models import Count, Prefetch, F, Exists, OuterRef
from django.utils import timezone
from collections import defaultdict
from django.views.decorators.http import require_POST
from .models import Post, Comment, Like, SavedPosts
from user.models import Follow
from .forms import CommentForm

# Create your views here.
def home(request):
    return render(request, 'syntaxandstories/index.html')




@login_required
def feed(request):
    # Subquery to check if author is followed by the user
    follow_subquery = Follow.objects.filter(
        follower=request.user,
        following=OuterRef('author')
    )

    # Prefetch user interactions
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

    # Fetch all posts
    posts = (
        Post.objects.all()
        .select_related('author')
        .prefetch_related('comments', user_likes_prefetch, user_saves_prefetch)
        .annotate(
            num_likes=Count('likes', distinct=True),
            num_comments=Count('comments', distinct=True),
            author_is_followed=Exists(follow_subquery)
        )
        .order_by('-created_at')
    )

    # Scoring
    now = timezone.now()
    scored_posts = []

    for post in posts:
        hours_old = (now - post.created_at).total_seconds() / 3600

        # Engagement score
        engagement_score = post.num_likes * 1 + post.num_comments * 2

        # Relationship boost
        relationship_score = 5 if post.author_is_followed else 0

        # Time decay
        time_decay = hours_old * 0.5

        score = engagement_score + relationship_score - time_decay
        scored_posts.append((post, score))

    # Rank posts
    scored_posts.sort(key=lambda x: x[1], reverse=True)

    # Diversity control: max 2 posts per author
    max_posts_per_user = 2
    author_count = defaultdict(int)
    final_feed = []

    for post, score in scored_posts:
        if author_count[post.author_id] >= max_posts_per_user:
            continue

        final_feed.append(post)
        author_count[post.author_id] += 1

        if len(final_feed) == 20:  # limit feed to 20 posts
            break

    context = {
        'posts': final_feed
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

            





@login_required
@require_POST
def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if request.method == 'POST':
        print("Hello") 
        form = CommentForm(request.POST)
        
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.user = request.user
            comment.save()

            # Return JSON with comment info
            return JsonResponse({
                'success': True,
                'author':comment.author.id,
                'username': request.user.username,
                'content': comment.content,
                'created_at': comment.created_at.strftime("%b %d, %Y %H:%M"),
                'user_avatar':request.user.profile.profile_picture.url if request.user.profile.profile_picture else 'https://via.placeholder.com/40'
            })
        return JsonResponse({'success': False, 'errors': form.errors})
