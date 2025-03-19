from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Profile
from core.models import Recipe

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
      password = serializers.CharField(write_only=True, required=True,validators=[validate_password])
      password2 = serializers.CharField(write_only=True, required=True)
      
      class Meta:
            model = User
            fields = ('email','password','password2')
      
      def validate(self, attrs):
            if attrs['password'] != attrs['password2']:
                  raise serializers.ValidationError({'password':'passwords do not match !'})
            return attrs
      
      def create(self,validated_data):
            validated_data.pop('password2')
            user = User.objects.create_user(**validated_data)
            user.set_password(validated_data['password'])
            user.save()
            return user
      

class RecipeSerializer(serializers.ModelSerializer):
      class Meta:
            model = Recipe
            fields = ('id', 'title')

class ProfileSerializer(serializers.ModelSerializer):
      favorite_recipes = RecipeSerializer(many=True, read_only=True)

      class Meta:
            model = Profile
            fields = ('nickname', 'avatar', 'favorite_recipes')