from django.urls import path
from .views import (RecipeDetailAPIView,
                    GetIngredientsView,
                    FilteredRecipeListAPIView, MLRecipeRecommendationAPIView,
                    UserShoppingListAPIView, ShoppingListDeleteAPIView,
                    IngredientAlternativeLLMView)

urlpatterns = [
    #path('', RecipeListCreateAPIView.as_view(), name='recipe-list-create'),#yok
    path('<int:id>/', RecipeDetailAPIView.as_view(), name='recipe-detail'),
    path('ingredients/', GetIngredientsView.as_view(), name='ingredients-list'),
    #path('find-recipes/', FindRecipesByIngredientsView.as_view(), name='find-recipe-ingredients'),#yok
    path('recipes/', FilteredRecipeListAPIView.as_view(), name='recipes-list'),
    path("ml-recommend/", MLRecipeRecommendationAPIView.as_view(), name="ml-recommend"),
    path("shoppinglist/", UserShoppingListAPIView.as_view(), name="shoppinglist-list-create"),
    path("shoppinglist/<int:pk>/", ShoppingListDeleteAPIView.as_view(), name="shoppinglist-delete"),
    path("ingredient-alternative-llm/", IngredientAlternativeLLMView.as_view(), name="ingredient-alternative-llm"),
]