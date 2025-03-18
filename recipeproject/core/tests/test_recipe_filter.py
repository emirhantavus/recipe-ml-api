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
                  title='Chocolate Cake',
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
            
      def test_filter_by_title(self):
            response = self.client.get(self.url, {'title':self.recipe_one.title})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['title'], 'Chocolate Cake')
            
      def test_filter_by_invalid_title(self):
            response = self.client.get(self.url, {'title':'invalid_title'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data['results']), 0)
            self.assertFalse(response.data['results'])
            
      def test_filter_not_return_unrelated_recipe(self):
            response = self.client.get(self.url, {'title':'Vanilla Cake'})
            self.assertNotEqual(response.status_code, 404)
            if response.data['results']:
                  self.assertNotEqual(response.data['results'][0]['title'], 'Chocolate Cake')
                  
      def test_response_should_not_error(self):
            response = self.client.get(self.url)
            self.assertNotIn('error',response.data)
            
      def test_filter_prep_time(self):
            response = self.client.get(self.url, {'prep_time':30})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['prep_time'], self.recipe_one.prep_time)
            
      def test_filter_prep_time_lte(self):
            response = self.client.get(self.url, {'prep_time__lte':25})
            self.assertEqual(response.status_code, 200)
            for result in response.data['results']:
                  self.assertLessEqual(result['prep_time'], 25)
                  print(result) # None. Cuz its prep_time is 30
                  
      def test_filter_prep_time_by_invalid_value(self):
            response = self.client.get(self.url, {'prep_time':'deneme'})  #got error here and we fix it in views.py
            self.assertEqual(response.status_code, 400)
            response = self.client.get(self.url, {'prep_time':-25})
            self.assertEqual(response.status_code, 400)
            response = self.client.get(self.url, {'prep_time__lte':'deneme'})
            self.assertEqual(response.status_code, 400)
            response = self.client.get(self.url, {'prep_time__lte':-25})
            self.assertEqual(response.status_code, 400)
            
      def test_filter_cook_time(self):
            response = self.client.get(self.url, {'cook_time':30})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['cook_time'], self.recipe_one.cook_time)
            
      def test_filter_cook_time_gte(self):
            response = self.client.get(self.url, {'cook_time__gte':40})
            self.assertEqual(response.status_code, 200)
            for result in response.data['results']:
                  self.assertGreaterEqual(result['cook_time'], 40)
                  
      def test_filter_cook_time_by_invalid_value(self):
            response = self.client.get(self.url, {'cook_time__gte':'deneme'})
            self.assertEqual(response.status_code, 400)
            response = self.client.get(self.url, {'cook_time__gte':-25})
            self.assertEqual(response.status_code, 400)
            
      def test_filter_by_ingredient_name(self):
            response = self.client.get(self.url, {'ingredient':'ingre-1'})
            self.assertEqual(response.status_code, 200)
            self.assertGreaterEqual(len(response.data['results']), 0)
            for result in response.data['results']:
                  for ing in result['ingredients']:
                        ingredient_names = ing['ingredient']['name']
                        self.assertIn('ingre-1', ingredient_names)
                        
      def test_filter_by_ingredient_no_results(self):
            response = self.client.get(self.url, {'ingredient':'none'})
            self.assertAlmostEqual(response.status_code, 200)
            self.assertEqual(len(response.data['results']), 0)
            
      def test_ordering_by_prep_time(self):
            response = self.client.get(self.url, {'ordering':'prep_time'}) # exp endpoint: ?ordering=prep_time
            self.assertEqual(response.status_code, 200)
            
            prep_times = [result['prep_time'] for result in response.data['results']]
            self.assertEqual(prep_times, sorted(prep_times)) # we can write more. maybe later.
            
      def test_ordering_with_invalid_value(self):
            response = self.client.get(self.url, {'ordering':'invalid_smth'})
            self.assertEqual(response.status_code, 400)
            self.assertIn('error', response.data)
            self.assertEqual(response.data['error'], 'Invalid fields..')