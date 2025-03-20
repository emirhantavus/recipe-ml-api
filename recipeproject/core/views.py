from django.shortcuts import render
from .models import Recipe, RecipeIngredient ,Ingredient , IngredientAlternative
from .serializers import RecipeSeralizer, RecipeIngredientSerailizer,IngredientSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count
from django.db import models

class RecipePagination(PageNumberPagination):
      page_size = 10
      page_size_query_param = 'page_size'
      max_page_size = 100
    
class RecipeListCreateAPIView(APIView):

      def get(self, request):
            queryset = Recipe.objects.all().order_by('id')
            
            title = request.GET.get('title')
            if title:
                  queryset = queryset.filter(title__icontains=title)
                  
            prep_time = request.GET.get('prep_time')
            if prep_time:
                  if prep_time and prep_time.isdigit():
                        queryset = queryset.filter(prep_time=int(prep_time))
                  else:
                        return Response({'error':'Invalid prep_time value.'}, status=status.HTTP_400_BAD_REQUEST)
                  
            prep_time_lte = request.GET.get('prep_time__lte')
            if prep_time_lte:
                  if prep_time_lte and prep_time_lte.isdigit():
                        queryset = queryset.filter(prep_time__lte=int(prep_time_lte))
                  else:
                        return Response({'error':'Invalid prep_time value.'}, status=status.HTTP_400_BAD_REQUEST)
                  
            cook_time_gte = request.GET.get('cook_time__gte')
            if cook_time_gte:
                  if cook_time_gte and cook_time_gte.isdigit():
                        queryset = queryset.filter(cook_time__gte=cook_time_gte)
                  else:
                        return Response({'error':'Invalid cook_time__gte value.'}, status=status.HTTP_400_BAD_REQUEST)
                  
            ingredient_name = request.GET.get('ingredient')
            if ingredient_name:
                  queryset = queryset.filter(ingredients__ingredient__name__icontains=ingredient_name)
            
            valid_ordering_fields = ['prep_time', 'cook_time', 'servings', 'title', 'created_at']
            ordering = request.GET.get('ordering')
            if ordering:
                  ordering_fields = ordering.split(',')
                  valid_fields = [field for field in ordering_fields if field.lstrip('-') in valid_ordering_fields]
                  
                  if valid_fields:
                        queryset = queryset.order_by(*valid_fields)
                  else:
                        return Response({'error':'Invalid fields..'},status=status.HTTP_400_BAD_REQUEST)
                  
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
            
            
class FindRecipesByIngredientsView(APIView):
      def post(self, request):
            user_ingredients = request.data.get('ingredients', [])
            
            if not user_ingredients:
                  return Response({'error':'Please use at least one ingredient.'},status=status.HTTP_400_BAD_REQUEST)
            
            matching_recipes = Recipe.objects.annotate(
                  matched_ingredients=Count("ingredients", filter=models.Q(ingredients__ingredient__name__in=user_ingredients))
            ).filter(
                  matched_ingredients=Count("ingredients")
                  ) # malzemeleri tamamen eşleşenleri burdan çekeriz.
            
            if matching_recipes.exists():
                  recipe_list = []
                  for recipe in matching_recipes:
                        recipe_list.append({
                              "title": recipe.title,
                              "description":recipe.description,
                              "ingredients":list(recipe.ingredients.values_list("ingredient__name", flat=True))
                        })
            
            all_recipes = Recipe.objects.all()
            alternative_suggestions = []
            
            for recipe in all_recipes:
                  recipe_ingredients = set(recipe.ingredients.values_list("ingredient__name",flat=True))
                  missing_ingredients = recipe_ingredients - set(user_ingredients) #eksik malzemeleri belirliyoz.
                  
                  if len(missing_ingredients) <= 2 and len(missing_ingredients) > 0:
                        #sonra değiştirebilirim burayı kalsın burası. 2 den az 0 dan büyükse suggest yaptıralım şuan.
                        alternative_suggestions.append({
                              "title":recipe.title,
                              "description":recipe.description,
                              "missing_ingredients":list(missing_ingredients)
                        })
            
            return Response({
                  "meessage":"there is exact matches." if recipe_list else "No exact matches found.",
                  "recipes":recipe_list,
                  "suggestions": alternative_suggestions
            }, status=status.HTTP_200_OK)
            
class GetIngredientsView(APIView):
      def get(self, request):
            ingredients = Ingredient.objects.all()
            serializer = IngredientSerializer(ingredients ,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
      
      def post(self,request):
            serializer = IngredientSerializer(data=request.data)
            if serializer.is_valid():
                  serializer.save()
                  return Response({'message':'Ingredient Created..'},status=status.HTTP_201_CREATED)
            return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)