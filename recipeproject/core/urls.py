from django.urls import path
from .views import RecipeDetailAPIView, RecipeListCreateAPIView

urlpatterns = [
    path('', RecipeListCreateAPIView.as_view(), name='recipe-list-create'),
    path('<int:id>/', RecipeDetailAPIView.as_view(), name='recipe-detail'),
]