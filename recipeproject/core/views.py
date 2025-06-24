from django.shortcuts import render
from .models import Recipe ,Ingredient , ShoppingList, RecipeReview , MealType
from .serializers import (RecipeSerializer,IngredientSerializer ,
                          ShoppingListSerializer, RecipeViewSerializer, MealTypeSerailizer)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status , generics
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated , AllowAny
from .utils.openai_utils import get_ingredient_alternatives_llm
from .ml.ml_recommender import RecipeRecommender
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

recommender = RecipeRecommender()


class RecipePagination(PageNumberPagination):
      page_size = 12
      page_size_query_param = 'page_size'
      max_page_size = 100
    
      
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
      
      
# class FilteredRecipeListAPIView(generics.ListAPIView):
#       queryset = Recipe.objects.all().order_by('-created_at')
#       serializer_class = RecipeSerializer
#       pagination_class = RecipePagination

#       filter_backends = [DjangoFilterBackend, SearchFilter]
#       filterset_fields = ['diet_type', 'meal_type', 'season']
#       search_fields    = ['title']
    
#       def get_serializer_context(self):
#             return {'request':self.request}

class RecipeFilter(django_filters.FilterSet):
    # Eğer meal_type ismiyle arama da istersen bu satırı EKLE ama FIELDS'a YAZMA!
    # meal_type_name = django_filters.CharFilter(field_name="meal_type__name", lookup_expr="iexact")

    class Meta:
        model = Recipe
        fields = ['diet_type', 'season', 'meal_type_fk']  # SADECE MODELDE OLANLAR!

class FilteredRecipeListAPIView(generics.ListAPIView):
    queryset = Recipe.objects.all().order_by('-created_at')
    serializer_class = RecipeSerializer
    pagination_class = RecipePagination

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = RecipeFilter
    search_fields = ['title']

    def get_serializer_context(self):
        return {'request': self.request}
      
      
class MLRecipeRecommendationAPIView(APIView):
    def post(self, request):
        meal_type = request.data.get("meal_type", "").strip()
        user_ingredients = [ing.strip() for ing in request.data.get("ingredients", [])]

        if not user_ingredients and not meal_type:
            return Response({"error": "At least ingredients or meal_type required."}, status=400)
        
        fav_ings = set()
        last_ings = set()
        if request.user.is_authenticated:
            profile = request.user.profile
            for r in profile.favorite_recipes.all():
                fav_ings.update([i.ingredient.name.lower() for i in r.ingredients.all()])
            for r in profile.last_viewed_recipes.all():
                last_ings.update([i.ingredient.name.lower() for i in r.ingredients.all()])

        results = recommender.recommend(
            user_ingredients,
            meal_type=meal_type,
            top_n=5,
            user_fav_ings= list(fav_ings),
            user_last_ings = list(last_ings),
            )
        return Response({"recommendations": results})


    
class UserShoppingListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        items = ShoppingList.objects.filter(user=request.user)
        serializer = ShoppingListSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = ShoppingListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'message':'Ingredients added successfuly'},status=status.HTTP_201_CREATED)
        return Response(serializer.errors)

class ShoppingListDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, pk):
        try:
            item = ShoppingList.objects.get(pk=pk, user=request.user)
        except ShoppingList.DoesNotExist:
            return Response({'error':'Item not found'},status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response({'message':'Item deleted succesfully'}, status=status.HTTP_204_NO_CONTENT)
    
    def patch(self, request, pk):
        try:
            item = ShoppingList.objects.get(pk=pk, user=request.user)
        except ShoppingList.DoesNotExist:
            return Response({'error':'Item not found'},status=status.HTTP_404_NOT_FOUND)
        missing_ingredients = request.data.get("missing_ingredients")
        if missing_ingredients is not None:
            item.missing_ingredients = missing_ingredients
            item.save()
            return Response({'message': 'Item updated'},status=status.HTTP_200_OK)
        return Response({'error':'missing field is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    
class IngredientAlternativeLLMView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        ingredients = request.data.get("ingredients")
        recipe_id = request.data.get("recipe_id")
        
        if not ingredients or not recipe_id:
            return Response({'error': 'Ingredients and recipe are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            recipe = Recipe.objects.get(id=recipe_id)
        except:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        
        alternatives = {}
        for ingredient in ingredients:
            if ingredient.strip().lower() in {"water"}:
                alternatives[ingredient] = "No alternative needed for water."
                continue
            
            llm_response = get_ingredient_alternatives_llm(
                ingredient,
                recipe.title
            )
            
            if "no suitable alternative exists" in llm_response.lower():
                alternatives[ingredient] = "There is no suitable alternative for this ingredient."
            else:
                alternatives[ingredient] = llm_response.strip()
        
        return Response({'alternatives': alternatives}, status=status.HTTP_200_OK)



class RecipeReviewListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id):
        recipe = get_object_or_404(Recipe, id=id)
        reviews = recipe.reviews.all().order_by('-created_at')
        serializer = RecipeViewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self,request,id):
        recipe = get_object_or_404(Recipe, id=id)
        review, created = RecipeReview.objects.get_or_create(
            recipe=recipe,
            user = request.user,
            defaults={
                'comment': request.data.get('comment',''),
                'rating': request.data.get('rating',None),
            }
        )
        
        if not created:
            review.comment = request.data.get('comment', review.comment)
            review.rating = request.data.get('rating', review.rating)
            review.save()
        
        serializer = RecipeViewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
class RecipeReviewDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = RecipeReview.objects.all()
    serializer_class = RecipeViewSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("Bu yorumu düzenlemeye yetkiniz yok.")
        return obj


class MealTypeAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self,request):
        mt = MealType.objects.all()
        serializer = MealTypeSerailizer(mt,many=True)
        return Response(serializer.data)