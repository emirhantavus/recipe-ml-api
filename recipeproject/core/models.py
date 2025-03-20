from django.db import models

class Recipe(models.Model):
      title = models.CharField(max_length=255, unique=True) 
      description = models.TextField(blank=True, null=True)
      instructions = models.TextField()  # adım adım yapılış için
      prep_time = models.IntegerField(help_text="Preparation time (minutes)")
      cook_time = models.IntegerField(help_text="Cooking time (minutes)")
      servings = models.IntegerField(default=1)
      created_at = models.DateTimeField(auto_now_add=True)  
      #updated_at = models.DateTimeField(auto_now=True) şuanlık kaldıralım.
    
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