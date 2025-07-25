from django.db import models
from django.conf import settings

class MealType(models.Model):
      name = models.CharField(max_length=50, unique=True)
      
      def __str__(self):
            return self.name

class Recipe(models.Model):
      title = models.CharField(max_length=255, unique=True) 
      description = models.TextField(blank=True, null=True)
      instructions = models.TextField()  # adım adım yapılış için
      prep_time = models.IntegerField(help_text="Preparation time (minutes)")
      cook_time = models.IntegerField(help_text="Cooking time (minutes)")
      servings = models.IntegerField(default=1)
      image = models.ImageField(upload_to="recipe_images/", blank=True, null=True)
      #updated_at = models.DateTimeField(auto_now=True) şuanlık kaldıralım.
      
      DIET_CHOICES = [
            ('regular', 'Regular'),
            ('vegetarian', 'Vegetarian'),
            ('vegan', 'Vegan'),
            ('gluten_free', 'Gluten Free'),
            ('keto', 'Keto'),
      ]
      diet_type = models.CharField(max_length=20, choices=DIET_CHOICES, default='regular')

      meal_type_fk = models.ForeignKey(MealType, on_delete=models.SET_NULL, null=True, blank=True, related_name="recipes")
      
      SEASON_CHOICES = [
            ('all', 'All Seasons'),
            ('spring', 'Spring'),
            ('summer', 'Summer'),
            ('autumn', 'Autumn'),
            ('winter', 'Winter'),
      ]
      season = models.CharField(max_length=10, choices=SEASON_CHOICES, default='all')
      created_at = models.DateTimeField(auto_now_add=True)
    
      def __str__(self):
            return self.title

class Ingredient(models.Model):
      name = models.CharField(max_length=100, unique=True) #malzeme adı.
      
      def __str__(self):
            return self.name


class RecipeIngredient(models.Model):
      recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="ingredients")  
      ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="recipes")  
      amount = models.FloatField()  #kullanılan miktar
      unit = models.CharField(max_length=50)  #burdakiyle ekleyelim.

      def __str__(self):
            return f"{self.amount} {self.unit} {self.ingredient.name} ({self.recipe.title})"

class IngredientAlternative(models.Model):
      original = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="alternatives")  
      alternative = models.ForeignKey(Ingredient, on_delete=models.CASCADE)  
      ratio = models.FloatField(default=1.0, help_text="Alternative ingredient ratio")
      
      def __str__(self):
            return f"{self.alternative.name} can replace {self.original.name}"
      
      
class ShoppingList(models.Model):
      user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shopping_list')
      recipe_title = models.CharField(max_length=200)
      missing_ingredients = models.JSONField()
      created_at = models.DateTimeField(auto_now_add=True)
      
      def __str__(self):
            return f"{self.user.username } - {self.recipe_title}"
      
      
class RecipeReview(models.Model):
      recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="reviews")
      user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
      comment = models.TextField(blank=True)
      rating = models.PositiveSmallIntegerField(null=True, blank=True)
      created_at = models.DateTimeField(auto_now_add=True)

      class Meta:
            unique_together = ("recipe", "user")

      def __str__(self):
            return f"{self.user.username} - {self.recipe.title} ({self.rating})"