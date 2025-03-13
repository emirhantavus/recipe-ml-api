from rest_framework import serializers
from .models import Recipe , Ingredient, RecipeIngredient, IngredientAlternative

class IngredientSerializer(serializers.ModelSerializer):
      class Meta:
            model = Ingredient
            fields = ('name','unit')
            
class RecipeIngredientSerailizer(serializers.ModelSerializer):
      ingredient = IngredientSerializer()
      
      class Meta:
            model = RecipeIngredient
            fields = ('ingredient','amount','unit')
            
class RecipeSeralizer(serializers.ModelSerializer):
      ingredients = RecipeIngredientSerailizer(source='ingredients.all',many=True)
      
      class Meta:
            model = Recipe
            fields = ('title','description','instructions','prep_time','cook_time','servings','ingredients')