from django.urls import reverse
from rest_framework.test import APITestCase
from ..models import Recipe , Ingredient, RecipeIngredient

class RecipeTest(APITestCase):
      def setUp(self):
            self.r_data = {
                  "title":"deneme title",
                  "description":"deneme desc",
                  "instructions":"insts",
                  "prep_time":10,
                  "cook_time":20,
                  "servings":5,
                  "ingredients": [
                        {
                              "ingredient": {"name": "ingre-1", "unit":"g"},
                              "amount":100,
                              "unit":"g"
                        }
                  ]
            }
            
            self.url = reverse('recipe-list-create')
            
            self.recipe_one = Recipe.objects.create(
                  title='t1',
                  description='d1',
                  instructions='i1',
                  prep_time=30,
                  cook_time=50,
                  servings=4
            )
            ingredient1, _ = Ingredient.objects.get_or_create(name="Sugar", unit="g")
            ingredient2, _ = Ingredient.objects.get_or_create(name="Flour", unit="g")
            
            RecipeIngredient.objects.create(recipe=self.recipe_one, ingredient=ingredient1, amount=200)
            RecipeIngredient.objects.create(recipe=self.recipe_one, ingredient=ingredient2, amount=500)
            
      def test_add_recipe(self):
            response = self.client.post(self.url, self.r_data, format='json')
            self.assertEqual(response.status_code, 201)
            self.assertEqual(Recipe.objects.count(),2) #in setUp and here, 2
            
      def test_get_recipes(self):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(Recipe.objects.count(),1) # just in setUp, 1
            self.assertIn('title',response.data['results'][0])