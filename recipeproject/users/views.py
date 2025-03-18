from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer

User = get_user_model()

class CustomTokenObtainSerializer(TokenObtainPairSerializer):
      @classmethod
      def get_token(cls, user):
            token = super().get_token(user)
            token['email'] = user.email # kalsın sonra bakılır.
            return token
      
      
class RegisterView(APIView):
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