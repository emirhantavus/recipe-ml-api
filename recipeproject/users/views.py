from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import (
    RegisterSerializer , PasswordChangeSerializer ,PasswordResetConfirmSerializer , PasswordResetSerializer,
    ProfileSerializer,)
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.http import urlsafe_base64_encode , urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from core.models import Recipe
from core.serializers import RecipeSerializer
from rest_framework import generics
from .models import ProfileRecipeView
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

class CustomTokenObtainSerializer(TokenObtainPairSerializer):
      @classmethod
      def get_token(cls, user):
            token = super().get_token(user)
            token['user_id'] = user.id
            return token
      
      
class RegisterView(APIView):
        permission_classes = [AllowAny,]
        def post(self, request):
            serializer = RegisterSerializer(data = request.data)
            if serializer.is_valid():
                  serializer.save()
                  return Response({"message":"User created successfuly"},status=status.HTTP_201_CREATED)
            return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST) 
      
class LoginView(TokenObtainPairView):
      serializer_class = CustomTokenObtainSerializer
      permission_classes = [AllowAny]
      
      def post(self, request, *args, **kwargs):
            response = super().post(request, *args, **kwargs)
            return Response({
                  'access':response.data['access'],
                  'refresh':response.data['refresh']
            },status=status.HTTP_200_OK)
            
class LogoutView(APIView):
      permission_classes = [IsAuthenticated]
      
      def post(self, request):
            try:
                  refresh_token = request.data.get('refresh')
                  if not refresh_token:
                        return Response({'error':'Refresh token is required'},status=status.HTTP_400_BAD_REQUEST)
                  token = RefreshToken(refresh_token)
                  token.blacklist()
                  return Response({'message':'Logout Successful'},status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                  return Response({'error':'Invalid Token'},status=status.HTTP_400_BAD_REQUEST)      
            
            
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_link = f"{request.scheme}://{request.get_host()}/api/users/password-reset-confirm/{uid}/{token}/"

                send_mail(
                    'Password Reset Request',
                    f'Click the link below to reset your password:\n{reset_link}',
                    'no-reply@myapp.com',
                    [email],
                    fail_silently=False,
                )
                return Response({"message": "Password reset email has been sent."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data={
            'new_password': request.data.get('new_password'),
            'uidb64': uidb64,
            'token': token,
        })
        if serializer.is_valid():
            return Response({"message": "Password has been reset."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password has been changed."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class AddFavoriteRecipeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self,request,recipe_id):
        profile = request.user.profile
        recipe = get_object_or_404(Recipe, id = recipe_id)
        
        if recipe in profile.favorite_recipes.all():
            profile.favorite_recipes.remove(recipe)
            return Response({"message":"Removed from favorites"},status=status.HTTP_200_OK)
        else:
            profile.favorite_recipes.add(recipe)
            return Response({"message":"Added to favorites"},status=status.HTTP_200_OK)
        
class RecipePagination(PageNumberPagination):
      page_size = 12
      page_size_query_param = 'page_size'
      max_page_size = 100
        
class FavoriteRecipeFilter(django_filters.FilterSet):
    class Meta:
        model = Recipe
        fields = ['diet_type', 'season', 'meal_type_fk']
        
class FavoriteListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecipeSerializer
    pagination_class = RecipePagination  # Bunu ekle (aynı recipes için)
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = FavoriteRecipeFilter
    search_fields = ['title']

    def get_queryset(self):
        profile = self.request.user.profile
        return profile.favorite_recipes.all().order_by('-created_at')
    
class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecipeVisitAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        profile = request.user.profile
        recipe = get_object_or_404(Recipe, id=id)
        obj, created = ProfileRecipeView.objects.get_or_create(profile=profile, recipe=recipe)
        obj.save()
        return Response({"message":"Recipe visit recorded"}, status=status.HTTP_200_OK)
    
class LastViewedRecipesAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecipeSerializer
    
    def get_queryset(self):
        profile = self.request.user.profile
        last_views = ProfileRecipeView.objects.filter(profile=profile).order_by('-viewed_at')[:10]
        recipes = [v.recipe for v in last_views]
        return recipes