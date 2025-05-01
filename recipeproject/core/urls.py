from django.urls import path
from .views import (RecipeDetailAPIView, RecipeListCreateAPIView, FindRecipesByIngredientsView,
                    GetIngredientsView,
                    FilteredRecipeListAPIView)

urlpatterns = [
    path('', RecipeListCreateAPIView.as_view(), name='recipe-list-create'),
    path('<int:id>/', RecipeDetailAPIView.as_view(), name='recipe-detail'),
    path('ingredients/', GetIngredientsView.as_view(), name='ingredients-list'),
    path('find-recipes/', FindRecipesByIngredientsView.as_view(), name='find-recipe-ingredients'),
    path('recipes/', FilteredRecipeListAPIView.as_view(), name='recipes-list'),
]