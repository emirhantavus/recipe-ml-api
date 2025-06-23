from django.urls import path
from .views import (RecipeDetailAPIView,
                    GetIngredientsView,
                    FilteredRecipeListAPIView, MLRecipeRecommendationAPIView,
                    UserShoppingListAPIView, ShoppingListDeleteAPIView,
                    IngredientAlternativeLLMView, RecipeReviewListCreateAPIView, RecipeReviewDeleteAPIView)

urlpatterns = [
    path('<int:id>/', RecipeDetailAPIView.as_view(), name='recipe-detail'),
    path('ingredients/', GetIngredientsView.as_view(), name='ingredients-list'),
    path('recipes/', FilteredRecipeListAPIView.as_view(), name='recipes-list'),
    path("ml-recommend/", MLRecipeRecommendationAPIView.as_view(), name="ml-recommend"),
    path("shoppinglist/", UserShoppingListAPIView.as_view(), name="shoppinglist-list-create"),
    path("shoppinglist/<int:pk>/", ShoppingListDeleteAPIView.as_view(), name="shoppinglist-delete"),
    path("ingredient-alternative-llm/", IngredientAlternativeLLMView.as_view(), name="ingredient-alternative-llm"),
    path('<int:id>/reviews/', RecipeReviewListCreateAPIView.as_view(), name='recipe-review-list-create'),
    path('<int:id>/reviews/delete/', RecipeReviewDeleteAPIView.as_view(), name='recipe-review-delete'),
]