from django.shortcuts import render
from .models import Recipe, RecipeIngredient ,Ingredient , IngredientAlternative
from .serializers import RecipeSeralizer, RecipeIngredientSerailizer,IngredientSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

class RecipePagination(PageNumberPagination):
      page_size = 10
      page_size_query_param = 'page_size'
      max_page_size = 100
    
class RecipeListCreateAPIView(APIView):

      def get(self, request):
            queryset = Recipe.objects.all()
            
            title = request.GET.get('title')
            if title:
                  queryset = queryset.filter(title__icontains=title)
                  
            prep_time = request.GET.get('prep_time')
            if prep_time:
                  queryset = queryset.filter(prep_time=prep_time)
                  
            prep_time_lte = request.GET.get('prep_time__lte')
            if prep_time_lte:
                  queryset = queryset.filter(prep_time__lte=prep_time_lte)
                  
            cook_time_gte = request.GET.get('cook_time__gte')
            if cook_time_gte:
                  queryset = queryset.filter(cook_time__gte=cook_time_gte)
                  
            ingredient_name = request.GET.get('ingredient')
            if ingredient_name:
                  queryset = queryset.filter(ingredients__ingredient__name__icontains=ingredient_name)
                  
            ordering = request.GET.get('ordering')
            if ordering:
                  ordering_fields = ordering.split(',')
                  queryset = queryset.order_by(*ordering_fields)
                  
            paginator = RecipePagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
                  
            serializer = RecipeSeralizer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
      
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
            