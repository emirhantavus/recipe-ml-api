from rest_framework import serializers
from .models import Recipe , Ingredient, RecipeIngredient, ShoppingList, RecipeReview
from django.db.models import Avg


class IngredientSerializer(serializers.ModelSerializer):
      class Meta:
            model = Ingredient
            fields = ('id','name',)
            
class RecipeIngredientSerializer(serializers.ModelSerializer):
      ingredient = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all())
      ingredient_name = serializers.CharField(source="ingredient.name", read_only=True)
      
      class Meta:
            model = RecipeIngredient
            fields = ('ingredient','ingredient_name','amount','unit')
            
            
class RecipeViewSerializer(serializers.ModelSerializer):
      class Meta:
            model = RecipeReview
            fields = ('id','recipe','user','comment','rating','created_at')
            read_only_fields = ('id', 'user', 'created_at', 'recipe')
            
      def create(self, validated_data):
            user = self.context['request'].user
            recipe = self.context['recipe']
            return RecipeReview.objects.create(user=user, recipe=recipe, **validated_data)
      
            
class RecipeSerializer(serializers.ModelSerializer):
      ingredients = RecipeIngredientSerializer(many=True)
      ingredient_name = serializers.CharField(source="ingredient.name", read_only=True)
      image = serializers.ImageField(required=False, allow_null=True,use_url=True)
      diet_type = serializers.ChoiceField(choices=Recipe.DIET_CHOICES, default='regular')
      meal_type = serializers.ChoiceField(choices=Recipe.MEAL_CHOICES, default='main')
      season = serializers.ChoiceField(choices=Recipe.SEASON_CHOICES, default='all')
      reviews = RecipeViewSerializer(many=True, read_only=True)
      average_rating = serializers.SerializerMethodField()
      review_count = serializers.SerializerMethodField()
      
      class Meta:
            model = Recipe
            fields = ('id','title','description','instructions','prep_time','cook_time','servings','image',
                      'diet_type','meal_type','season','ingredients','ingredient_name','reviews','average_rating',
                      'review_count')
            
      def create(self, validated_data):
            ingredients_data = validated_data.pop('ingredients', [])
            
            if isinstance(ingredients_data,dict) and 'all' in ingredients_data: # gelen data dict geliyor ama
                  ingredients_data = ingredients_data['all'] # 'all' key olarak geldi. pop() dan dolayı sanırım.
                  
            recipe = Recipe.objects.create(**validated_data)
            
            for data in ingredients_data:
                  ingredient = data.pop('ingredient')
                  RecipeIngredient.objects.create(recipe=recipe, ingredient=ingredient, **data)
                  
            return recipe
      
      def update(self, instance, validated_data):
            ingredients_data = validated_data.pop('ingredients',[])
            
            for attr, value in validated_data.items():
                  setattr(instance, attr, value)
            instance.save()
            
            instance.ingredients.all().delete()
            
            for data in ingredients_data:
                  RecipeIngredient.objects.create(recipe=instance, ingredient=data['ingredient'],amount=data['amount'],unit=data['unit'])
                              
            return instance
      
      def get_average_rating(self, obj):
            avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
            return round(avg, 2) if avg is not None else 0
      
      def get_review_count(self, obj):
            return obj.reviews.count()
      
class ShoppingListSerializer(serializers.ModelSerializer):
      class Meta:
            model = ShoppingList
            fields = ('id', 'recipe_title', 'missing_ingredients', 'created_at')
            