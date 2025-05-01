from django.shortcuts import render
from .models import Recipe, RecipeIngredient ,Ingredient , IngredientAlternative
from .serializers import RecipeSerializer, RecipeIngredientSerializer,IngredientSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status , generics
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count
from django.db import models
from .ml.ml_recommender import RecipeRecommender
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
import os , pickle
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, 'core', 'ml','ml_models' ,'recipes_cleaned.csv')
recommender = RecipeRecommender(CSV_PATH)

with open(os.path.join(BASE_DIR, "core","ml", "ml_models", "recipe_model.pkl"), "rb") as f:
    model_data = pickle.load(f)

df = model_data["df"]
title_vectorizer = model_data["title_vectorizer"]
title_matrix = model_data["title_matrix"]
ingredient_vectorizer = model_data["ingredient_vectorizer"]
ingredient_matrix = model_data["ingredient_matrix"]

def recommend(query_title, user_ingredients, alpha=0.5, top_n=5):
    title_vec = title_vectorizer.transform([query_title])
    title_scores = cosine_similarity(title_vec, title_matrix).flatten()

    common_ing = set(user_ingredients).intersection(set(ingredient_vectorizer.get_feature_names_out()))
    if not common_ing:
        return []

    ing_text = " ".join(common_ing)
    ing_vec = ingredient_vectorizer.transform([ing_text])
    ing_scores = cosine_similarity(ing_vec, ingredient_matrix).flatten()

    combined = alpha * title_scores + (1 - alpha) * ing_scores
    indices = combined.argsort()[-top_n:][::-1]

    results = []
    for idx in indices:
        results.append({
            "title": df.iloc[idx]["title"],
            "ingredients": df.iloc[idx]["ingredients"],
            "score": round(combined[idx], 3)
        })
    return results


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
                  
            serializer = RecipeSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
      
      def post(self, request):
            serializer = RecipeSerializer(data=request.data)
            if serializer.is_valid():
                  serializer.save()
                  return Response({'message':'Recipe created successfuly'}, status=status.HTTP_201_CREATED)
            return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
      
class RecipeDetailAPIView(APIView):
      def get(self, request, id):
            recipe = get_object_or_404(Recipe,id=id)
            serializer = RecipeSerializer(recipe)
            return Response(serializer.data,status=status.HTTP_200_OK)
      
      def put(self, request, id):
            recipe = get_object_or_404(Recipe,id=id)
            serializer = RecipeSerializer(recipe,data=request.data, partial=True)
            if serializer.is_valid():
                  serializer.save()
                  return Response(serializer.data,status=status.HTTP_200_OK)
            return Response({'errors':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
      
      def delete(self, request,id):
            recipe = get_object_or_404(Recipe,id=id)
            recipe_id = recipe.id
            recipe.delete()
            return Response({'message':f"Recipe id: {recipe_id} has been deleted successfuly."},
                            status=status.HTTP_204_NO_CONTENT)
            
            
class FindRecipesByIngredientsView(APIView):
      def post(self, request):
            user_ingredients = request.data.get('ingredients', [])
            recipe_title = request.data.get('title', None)
            
            if not user_ingredients:
                  return Response({'error':'Please use at least one ingredient.'},status=status.HTTP_400_BAD_REQUEST)
            
            recipe_list = []
            alternative_suggestions = []
            
            if recipe_title:
                  try:
                        recipes = Recipe.objects.filter(title__icontains=recipe_title)
                  except Recipe.DoesNotExist:
                        return Response({'error': f"No recipe found with {recipe_title}"},status=status.HTTP_404_NOT_FOUND)
                  
            else:
                  recipes = Recipe.objects.all()
            
            matching_recipes = recipes.annotate(
                  matched_ingredients=Count("ingredients", filter=models.Q(ingredients__ingredient__name__in=user_ingredients))
            ).filter(
                  matched_ingredients=Count("ingredients")
                  ) # malzemeleri tamamen eşleşenleri burdan çekeriz.
            
            if matching_recipes.exists():
                  for recipe in matching_recipes:
                        recipe_list.append({
                              "title": recipe.title,
                              "description":recipe.description,
                              "ingredients":list(recipe.ingredients.values_list("ingredient__name", flat=True))
                        })
            
            
            for recipe in recipes:
                  recipe_ingredients = set(recipe.ingredients.values_list("ingredient__name",flat=True))
                  missing_ingredients = recipe_ingredients - set(user_ingredients) #eksik malzemeleri belirliyoz.
                  
                  alternative_ingrediends = {}
                  for missing in missing_ingredients:
                        alternative_options = IngredientAlternative.objects.filter(original__name=missing)
                        alternative_ingrediends[missing] = [
                              {"alternative": alt.alternative.name, "ratio": alt.ratio} for alt in alternative_options
                        ]
                  
                  if len(missing_ingredients) <= 2 and len(missing_ingredients) > 0:
                        #sonra değiştirebilirim burayı kalsın burası. 2 den az 0 dan büyükse suggest yaptıralım şuan.
                        alternative_suggestions.append({
                              "title":recipe.title,
                              "description":recipe.description,
                              "missing_ingredients":list(missing_ingredients),
                              "alternative_ingredients": {k: v for k, v in alternative_ingrediends.items() if v}
                        })
                        
            #ml model deneme
            alpha = float(request.data.get('alpha', 0.5))
            ml_recommendations = recommender.recommend(
            query_title=recipe_title,
            user_ingredients=user_ingredients,
            alpha=alpha,
            top_n=5
            )
            
            return Response({
                  "meessage":"there is exact matches." if recipe_list else "No exact matches found.",
                  "recipes":recipe_list,
                  "suggestions": alternative_suggestions,
                  "ml_recommendations": ml_recommendations
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
      
      
class FilteredRecipeListAPIView(generics.ListAPIView):
      queryset = Recipe.objects.all().order_by('-created_at')
      serializer_class = RecipeSerializer
      pagination_class = RecipePagination

      filter_backends = [DjangoFilterBackend, SearchFilter]
      filterset_fields = ['diet_type', 'meal_type', 'season']
      search_fields    = ['title']
    
      def get_serializer_context(self):
            return {'request':self.request}
      
      
class MLRecipeRecommendationAPIView(APIView):
    def post(self, request):
        query_title = request.data.get("title", "").strip()
        user_ingredients = [i.strip().lower() for i in request.data.get("ingredients", [])]
        alpha = float(request.data.get("alpha", 0.5))

        if not query_title and not user_ingredients:
            return Response({"error": "At least title or ingredients are required."}, status=400)

        results = []

        # 🔍 Tam eşleşme değil, yakına bak (case-insensitive contains)
        exact_match = None
        if query_title:
            exact_match = Recipe.objects.filter(title__icontains=query_title).first()
            if exact_match:
                recipe_ings = [ri.ingredient.name.lower() for ri in exact_match.ingredients.all()]
                missing = list(set(recipe_ings) - set(user_ingredients))
                exact_score = 1.0 if not missing else round(1.0 - len(missing) / len(recipe_ings), 3)

                results.append({
                    "id": exact_match.id,
                    "title": exact_match.title,
                    "ingredients": ", ".join(recipe_ings),
                    "missing_ingredients": ", ".join(missing),
                    "image": request.build_absolute_uri(exact_match.image.url) if exact_match.image else None,
                    "score": exact_score
                })

        # 🤖 ML önerileri (sadece malzemeyle arıyorsan alpha = 0)
        adjusted_alpha = alpha if query_title else 0.0
        ml_results = recommend(query_title, user_ingredients, alpha=adjusted_alpha)

        for r in ml_results:
            if not any(r["title"].lower() == x["title"].lower() for x in results):
                matched = Recipe.objects.filter(title__iexact=r["title"]).first()
                recipe_ings = r["ingredients"].split(", ")
                missing = list(set([i.lower() for i in recipe_ings]) - set(user_ingredients))
                results.append({
                    "id": matched.id if matched else None,
                    "title": r["title"],
                    "ingredients": r["ingredients"],
                    "missing_ingredients": ", ".join(missing),
                    "image": request.build_absolute_uri(matched.image.url) if matched and matched.image else None,
                    "score": round(r["score"], 3)
                })

        return Response({"recommendations": results})