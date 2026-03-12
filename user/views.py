from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout, login, authenticate, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Sum, Count, Prefetch
from django.db import transaction
from .forms import UserCreationForm, ProfileForm, ChangeEmailForm, ChangePasswordForm
from .models import UserProfile, Follow
from syntaxandstories.models import Post, SavedPosts, Like

# Create your views here.

def sign_up(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('syntaxandstories:feed')
        
    else:
        form = UserCreationForm()
    return render(request, 'user/sign_up.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('syntaxandstories:home')


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return render(request, 'user/login.html', {'error': 'Invalid email or password.'})
        
        user = authenticate(request, username=user.username, password=password)
        if user is not None:
            login(request, user)
            return redirect('syntaxandstories:feed')
        else:
            return render(request, 'user/login.html', {'error': 'Invalid email or password.'})
        
    return render(request, 'user/login.html')

@login_required
def profile_view(request, username):
    user = get_object_or_404(User.objects.select_related("profile"), username=username)
    is_owner = request.user == user

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
        Post.objects.filter(author=user)
        .prefetch_related('comments', user_likes_prefetch, user_saves_prefetch)
        .annotate(
            comments_count=Count('comments', distinct=True)
        )
        .order_by("-created_at")
        )
    
    liked_posts = Post.objects.filter(likes__user=user).distinct().exclude(author=user)
    saved_posts = Post.objects.filter(saved_by__user=user).distinct().order_by('-created_at')

   

    followers_count = user.followers.count()
    following_count = user.following.count()
    
    total_likes = posts.aggregate(
        total=Sum('likes_count')
    )['total'] or 0

    is_following = Follow.objects.filter(
        follower=request.user,
        following=user
    ).exists()
    
    context = {
        'user':user,
        'user_profile':user.profile,
        'is_owner':is_owner,
        'followers_count':followers_count,
        'following_count':following_count,
        'total_likes':total_likes,
        'is_following':is_following,
        'posts':posts,
        'liked_posts':liked_posts,
        'saved_posts':saved_posts,
        'user_liked':user_likes_prefetch,
        'user_saved':user_saves_prefetch,
    }
    return render(request, 'user/profile.html', context)

@login_required
def edit_profile_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    user_profile = get_object_or_404(UserProfile, user=profile_user)
    
    if profile_user == request.user:
        if request.method == 'POST':
            form = ProfileForm(request.POST, request.FILES, instance=user_profile)
            if form.is_valid():
                form.save()
                return redirect('user:profile', username=request.user.username)
        else:
            form = ProfileForm(instance=user_profile)


    context = {
            'form':form,
            'user_profile':user_profile
        }
    return render(request, 'user/edit_profile.html', context)



@login_required
def toggle_follow(request, username):
    if request.method == 'POST':

        user_to_follow = get_object_or_404(User, username=username)

        if user_to_follow == request.user:
            return JsonResponse({
                'error':'You cannot follow yourself'
            })

        with transaction.atomic():    
            follow, created = Follow.objects.get_or_create(
                follower=request.user,
                following=user_to_follow
            )
            
            if created:
                following=True
            else:
                follow.delete()
                following = False

            followers_count = user_to_follow.followers.count()
            following_count = Follow.objects.filter(follower=request.user).count()

            is_following = Follow.objects.filter(
                follower=request.user,
                following=user_to_follow
            ).exists()


        return JsonResponse({
            'success':True,
            'following':following,
            'followers_count':followers_count,
            'is_following':is_following,
            'following_count':following_count,
        })

@login_required 
def settings_view(request):
    return render(request, 'user/settings.html')

def privacy_and_terms(request):
    return render(request, 'user/privacy.html')

@login_required
@require_POST
def change_email(request):
    user = request.user
    form = ChangeEmailForm(request.POST, instance=user)

    if form.is_valid():
        form.save()

        return JsonResponse({
            'success':True,
            'message':'Email updated successfully',
            'new_email':user.email
        })
    
    else:
        errors = {field: error.get_json_data() for field, error in form.errors.items()}

        return JsonResponse({
            'success':False,
            'errors':errors
        })
    

def change_password(request):
    if request.method == 'POST':
        form = ChangePasswordForm(request.POST, instance=request.user)

        if form.is_valid():
            request.user.set_password(form.cleaned_data['new_password'])
            request.user.save()

            update_session_auth_hash(request, user=request.user)
            return JsonResponse({
                'success':True,
                'message':'Password changed successfully'
            })
        
        errors = {field:error.get_json_data() for field, error in form.errors.items()}
        return JsonResponse({
            'success':False,
            'message':'Passwords mismatch'
        })
    
    return JsonResponse({
        'success':False,
        'message':'Invalid request'
    })


def followers_list(request):
    followers = Follow.objects.filter(
        following=request.user
    )
    
    for follower in followers:
        print(follower.follower)
    context = {
        'followers':followers
    }

    return render(request, 'user/followers_list.html', context)