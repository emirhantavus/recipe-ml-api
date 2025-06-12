from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from core.models import Recipe

class CustomUserManager(BaseUserManager):
      def create_user(self, email, username,password=None, **extra_fields):
            if not email:
                raise ValueError("Email address is required")
            if not username:
                raise ValueError("Username is required")
            email = self.normalize_email(email)
            extra_fields.setdefault('is_active', True)
            user = self.model(email=email, username=username,**extra_fields)
            user.set_password(password)
            user.save(using=self._db)
            return user

      def create_superuser(self, email, username,password=None, **extra_fields):
            extra_fields.setdefault('is_staff', True)
            extra_fields.setdefault('is_superuser', True)
            if extra_fields.get('is_staff') is not True:
                  raise ValueError('Superuser must have is_staff=True.')
            if extra_fields.get('is_superuser') is not True:
                  raise ValueError('Superuser must have is_superuser=True.')
            return self.create_user(email, username,password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
      email = models.EmailField(unique=True)
      username = models.CharField(max_length=55, unique=True)
      
      is_active = models.BooleanField(default=True)
      is_staff = models.BooleanField(default=False)
      
      objects = CustomUserManager()
         
      USERNAME_FIELD = 'email'
      REQUIRED_FIELDS = ['username']
      
      def save(self, *args, **kwargs):
            self.email = self.email.lower()
            super().save(*args, **kwargs)
      
      def __str__(self):
          return f"User: {self.email} | Username: {self.username} | Active: {self.is_active}"
    

class Profile(models.Model):
      user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="profile")
      nickname = models.CharField(max_length=50, unique=True, blank=True, null=True)
      avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
      favorite_recipes = models.ManyToManyField(Recipe, blank=True, related_name="favorited_by")
         
      def __str__(self):
          return f"{self.user.email} - {self.nickname if self.nickname else 'No Nickname'}"