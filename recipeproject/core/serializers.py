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
            
      def create(self, validated_data):
            ingredients_data = validated_data.pop('ingredients', [])
            
            if isinstance(ingredients_data,dict) and 'all' in ingredients_data: # gelen data dict geliyor ama
                  ingredients_data = ingredients_data['all'] # 'all' key olarak geldi. pop() dan dolayı sanırım.
                  
            recipe = Recipe.objects.create(**validated_data)
            
            for data in ingredients_data:
                  ing_data = data.pop('ingredient')
                  ingredient, _=Ingredient.objects.get_or_create(**ing_data)
                  RecipeIngredient.objects.create(recipe=recipe, ingredient=ingredient, **data)
                  
            return recipe