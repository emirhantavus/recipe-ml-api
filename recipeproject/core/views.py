from django.shortcuts import render
from .models import Recipe, RecipeIngredient ,Ingredient , IngredientAlternative
from .serializers import RecipeSeralizer, RecipeIngredientSerailizer,IngredientSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .filters import RecipeFilter
from django_filters.rest_framework import DjangoFilterBackend

class RecipeListCreateAPIView(APIView):
      filter_backends = [DjangoFilterBackend]
      filterset_class = RecipeFilter
      
      def get(self, request):
            queryset = Recipe.objects.all()
            filtered_queryset = RecipeFilter(request.GET, queryset=queryset)
            if filtered_queryset.is_valid():
                  queryset = filtered_queryset.qs
            serializer = RecipeSeralizer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
      
      def post(self, request):
            serializer = RecipeSeralizer(data=request.data)
            if serializer.is_valid():
                  serializer.save()
                  return Response({'message':'Recipe created successfuly'}, status=status.HTTP_201_CREATED)
            return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
      
class RecipeDetailAPIView(APIView):
      def get(self, request, id):
            recipe = get_object_or_404(Recipe,id=id)
            serializer = RecipeSeralizer(recipe)
            return Response(serializer.data,status=status.HTTP_200_OK)
      
      def put(self, request, id):
            recipe = get_object_or_404(Recipe,id=id)
            serializer = RecipeSeralizer(recipe,data=request.data, partial=True)
            if serializer.is_valid():
                  serializer.save()
                  return Response(serializer.data,status=status.HTTP_200_OK)
            return Response({'errors':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
      
      def delete(self, request,id):
            recipe = get_object_or_404(Recipe,id=id)
            recipe_id = recipe.id
            recipe.delete()
            return Response({'message':f"Recipe id: {recipe_id} has been deleted successfuly."},
                            status=status.HTTP_204_NO_CONTENT
                        )
            