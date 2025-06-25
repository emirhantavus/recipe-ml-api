import os
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import inflect
from core.models import Recipe, MealType, Ingredient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class RecipeRecommender:
    MEAL_TYPE_MAPPING = {
        "main course": "main",
        "side dish": "side",
        "soup": "soup",
        "salad": "salad",
        "dessert": "dessert",
        "breakfast": "breakfast"
    }

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

    def normalize_title(self, title):
        return title.strip().lower().replace("’", "'").replace("`", "'")

    def get_recipe_obj_by_title(self, title):
        norm_title = self.normalize_title(title)
        obj = Recipe.objects.filter(title__iexact=norm_title).first()
        if obj:
            return obj
        obj = Recipe.objects.filter(title__icontains=norm_title).first()
        if obj:
            return obj
        return None

    def recommend(self, user_ingredients, meal_type=None, top_n=5, user_fav_ings=None, user_last_ings=None):
        user_ingredients = [self.normalize_ingredient(i) for i in user_ingredients]
        user_fav_ings = set(user_fav_ings or [])
        user_last_ings = set(user_last_ings or [])

        ingredient_whitelist = set(i.lower() for i in Ingredient.objects.values_list("name", flat=True))
        user_ingredients = [i for i in user_ingredients if i in ingredient_whitelist]

        if not user_ingredients:
            return []

        df_filtered = self.df
        matrix_filtered = self.ingredient_matrix

        if meal_type:
            try:
                mt_obj = MealType.objects.get(id=meal_type)
                meal_type_name = mt_obj.name.lower()
                csv_meal_type = self.MEAL_TYPE_MAPPING.get(meal_type_name, meal_type_name)
                idxs = self.df[self.df["meal_type"].str.lower() == csv_meal_type].index
                if len(idxs) == 0:
                    return []
                df_filtered = self.df.loc[idxs]
                matrix_filtered = self.ingredient_matrix[idxs]
            except MealType.DoesNotExist:
                return []

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
            score = round(final_score * 100, 1)   # 0-100 arası skor

            if score < 30:
                continue

            recipe_obj = self.get_recipe_obj_by_title(rec["title"])

            results.append({
                "id": recipe_obj.id if recipe_obj else None,
                "title": rec["title"],
                "ingredients": rec["ingredients"],
                "meal_type": rec["meal_type"],
                "score": score,
                "missing_ingredients": ", ".join(sorted(missing)),
                "image": recipe_obj.image.url if (recipe_obj and recipe_obj.image) else None,
            })

        results = sorted(results, key=lambda x: x['score'], reverse=True)[:top_n]
        return results
