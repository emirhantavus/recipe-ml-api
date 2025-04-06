import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os

class RecipeRecommender:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        ml_dir = os.path.join(base_dir, './ml_models')

        with open(os.path.join(ml_dir, 'vectorizer.pkl'), 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        with open(os.path.join(ml_dir, 'tfidf_matrix.pkl'), 'rb') as f:
            self.tfidf_matrix = pickle.load(f)

        self.df = pd.read_csv(os.path.join(ml_dir, 'recipes.csv'))

    def recommend(self, recipe_title, user_ingredients, top_n=5):
        user_ingredients = [ing.strip().lower() for ing in user_ingredients]

        filtered_recipes = self.df[self.df['title'].str.contains(recipe_title, case=False)].copy()

        if filtered_recipes.empty:
            return []

        user_ing_text = " ".join(user_ingredients)
        user_vec = self.vectorizer.transform([user_ing_text])
        
        sim_scores = cosine_similarity(user_vec, self.tfidf_matrix[filtered_recipes.index]).flatten()
        top_indices = sim_scores.argsort()[-top_n:][::-1]

        recommendations = []
        for i in top_indices:
            idx = filtered_recipes.index[i]
            rec_recipe = self.df.iloc[idx]

            recipe_ingredients = [ing.strip().lower() for ing in rec_recipe['ingredients'].split(',')]

            missing_ingredients = set(recipe_ingredients) - set(user_ingredients)

            recommendations.append({
                "title": rec_recipe['title'],
                "ingredients": recipe_ingredients,
                "missing_ingredients": list(missing_ingredients),
                "similarity_score": sim_scores[i]
            })

        return recommendations
