from django.urls import reverse
from rest_framework.test import APITestCase
from ..models import Recipe , Ingredient, RecipeIngredient

class RecipeDetailTest(APITestCase):
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
            
            self.url = reverse('recipe-detail', kwargs={'id':self.recipe_one.id})
            self.invalid_url = reverse('recipe-detail', kwargs={'id':619}) # invalid ID
            
      def test_recipe_get_by_id(self):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(Recipe.objects.count(),1)
            self.assertIn('title',response.data)
            self.assertEqual(response.data['title'], 't1')
            
      def test_recipe_get_invalid_id(self):
            response = self.client.get(self.invalid_url)
            self.assertEqual(response.status_code, 404)
            
      def test_recipe_put_by_id(self):
            data = {
                  'title':'new_title'
            }
            response = self.client.put(self.url,data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data['title'], 'new_title')
            
      def test_recipe_put_invalid_data(self):
            data = {"title": ""}
            response = self.client.put(self.url, data)
            self.assertEqual(response.status_code, 400)
            
      def test_recipe_delete_by_id(self):
            response = self.client.delete(self.url)
            self.assertEqual(response.status_code, 204)
            self.assertEqual(Recipe.objects.count(),0)
            
      def test_recipe_delete_invalid_id(self):
            response = self.client.delete(self.invalid_url)
            self.assertEqual(response.status_code, 404)