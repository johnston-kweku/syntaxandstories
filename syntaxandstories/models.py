from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator

# Create your models here.



class Post(models.Model):
    class Category(models.TextChoices):
        TECH = 'TECH', 'Tech'
        STORY = 'STORY', 'Story'
        LIFESTYLE = 'LIFESTYLE', 'Lifestyle'
        OTHER = 'OTHER', 'Other'

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, null=True, blank=True)
    content = models.TextField(max_length=6000, null=True, blank=True)
    media = models.FileField(upload_to='post_media/', null=True, blank=True, validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'])])
    created_at = models.DateTimeField(auto_now_add=True)

    category = models.CharField(
        max_length=10,
        choices=Category.choices,
        default=Category.OTHER,
    )


    likes_count = models.PositiveBigIntegerField(default=0)


    def __str__(self):
        return self.title if self.title else 'Untitled Post'
    
    def is_video(self):
        return self.media and self.media.name.lower().endswith(('.mp4', '.mov', '.avi'))
    
    def is_image(self):
        return self.media and self.media.name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=2000, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
    

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE,  related_name='likes')

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f'{self.user.username} likes {self.post.author.username}\'s post "{self.post.title}"'


class SavedPosts(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} saved {self.post.author}'s post {self.post}"
    
    class Meta:
        verbose_name_plural = 'Saved Posts'