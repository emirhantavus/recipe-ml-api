import os
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import inflect
from core.models import Recipe , MealType

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class RecipeRecommender:
    def __init__(self):
        model_path = os.path.join(BASE_DIR, "ml", "ml_models", "recipe_model.pkl")
        with open(model_path, "rb") as f:
            model_data = pickle.load(f)
        self.df = model_data["df"]
        self.ingredient_vectorizer = model_data["ingredient_vectorizer"]
        self.ingredient_matrix = model_data["ingredient_matrix"]
        self.p = inflect.engine()

    def normalize_ingredient(self, word):
        singular = self.p.singular_noun(word)
        return singular.lower() if singular else word.lower()

    def get_recipe_obj_by_title(self, title):
        normalized_title = title.strip().lower()
        obj = Recipe.objects.filter(title__iexact=normalized_title).first()
        if obj:
            return obj
        return Recipe.objects.filter(title__icontains=normalized_title).first()

    def recommend(self, user_ingredients, meal_type=None, top_n=5, user_fav_ings=None, user_last_ings=None):
        user_ingredients = [self.normalize_ingredient(i) for i in user_ingredients]
        user_fav_ings = set(user_fav_ings or [])
        user_last_ings = set(user_last_ings or [])

        df_filtered = self.df
        matrix_filtered = self.ingredient_matrix
        
        if meal_type:
            if str(meal_type).isdigit():
                try:
                    mt_obj = MealType.objects.get(id=int(meal_type))
                    meal_type_name = mt_obj.lower()
                except MealType.DoesNotExist:
                    return []
            else:
                meal_type_name = str(meal_type).lower()
            idxs = self.df[self.df["meal_type"].str.lower() == meal_type.lower()].index
            if len(idxs) == 0:
                return []
            df_filtered = self.df.loc[idxs]
            matrix_filtered = self.ingredient_matrix[idxs]

        if df_filtered.shape[0] == 0:
            return []

        query = " ".join(user_ingredients)
        vec = self.ingredient_vectorizer.transform([query])
        sim = cosine_similarity(vec, matrix_filtered).flatten()

        results = []
        IGNORE_INGREDIENTS = {"water"}
        for i in sim.argsort()[-top_n*2:][::-1]:
            rec = df_filtered.iloc[i]
            recipe_ingredients = [self.normalize_ingredient(x.strip()) for x in str(rec["ingredients"]).split(",")]
            matched = set(user_ingredients).intersection(set(recipe_ingredients))
            missing = [
                 ing for ing in (set(recipe_ingredients) - set(user_ingredients))
                if ing not in IGNORE_INGREDIENTS
            ]
            overlap_ratio = len(matched) / len(recipe_ingredients) if recipe_ingredients else 0

            fav_intersection = set(recipe_ingredients) & user_fav_ings
            fav_overlap_ratio = len(fav_intersection) / len(recipe_ingredients) if recipe_ingredients else 0
            fav_bonus = 0.20 * fav_overlap_ratio 

            last_intersection = set(recipe_ingredients) & user_last_ings
            last_overlap_ratio = len(last_intersection) / len(recipe_ingredients) if recipe_ingredients else 0
            last_bonus = 0.10 * last_overlap_ratio

            if not missing and len(recipe_ingredients) > 0:
                final_score = 1.0
            else:
                final_score = 0.65 * sim[i] + 0.35 * overlap_ratio + fav_bonus + last_bonus 

            final_score = max(final_score, 0) 

            recipe_obj = self.get_recipe_obj_by_title(rec["title"])
            if not recipe_obj:
                print(f"[DEBUG] DB'de id bulunamadı! -> {rec['title']}")

            results.append({
                "id": recipe_obj.id if recipe_obj else None,
                "title": rec["title"],
                "ingredients": rec["ingredients"],
                "meal_type": rec["meal_type"],
                "score": round(final_score, 3),
                "missing_ingredients": ", ".join(sorted(missing))
            })

        results = sorted(results, key=lambda x: x['score'], reverse=True)[:top_n]
        return results

