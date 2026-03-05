from django import forms
from django.contrib.auth.models import User
from .models import UserProfile


class UserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput, label="Confirm Password")

    class Meta:
        model = User
        fields = [
            'first_name', 'email'
        ]

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')       
        password2 = cleaned_data.get('password2')       

        if password and password2 and password != password2:
            raise forms.ValidationError("Passwords do not match")

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already exists")
        return email
    
    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data["email"]
        password = self.cleaned_data["password"]

        # Auto-generate username
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        user.username = username

        # Set the password properly
        user.set_password(password)

        if commit:
            user.save()
        return user


class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = [
            'profile_name', 'profile_picture', 'bio', 'location', 'link', 'skills'
        ]