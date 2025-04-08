import pandas as pd
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RecipeRecommender:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        self.df["ingredients_cleaned"] = self.df["ingredients_cleaned"].fillna("")

        self.title_vectorizer = TfidfVectorizer()
        self.title_matrix = self.title_vectorizer.fit_transform(self.df["name"])

        self.ingredient_vectorizer = TfidfVectorizer()
        self.ingredient_matrix = self.ingredient_vectorizer.fit_transform(self.df["ingredients_cleaned"])

    def recommend(self, query_title, user_ingredients, alpha=0.5, top_n=5):
        title_vec = self.title_vectorizer.transform([query_title])
        ingredient_query = " ".join(user_ingredients)
        ingredient_vec = self.ingredient_vectorizer.transform([ingredient_query])

        title_sim = cosine_similarity(title_vec, self.title_matrix).flatten()
        ingredient_sim = cosine_similarity(ingredient_vec, self.ingredient_matrix).flatten()

        final_score = alpha * title_sim + (1 - alpha) * ingredient_sim
        top_indices = final_score.argsort()[-top_n:][::-1]

        results = []
        for idx in top_indices:
            results.append({
                "title": self.df.iloc[idx]["name"],
                "ingredients": self.df.iloc[idx]["ingredients_cleaned"],
                "similarity_score": round(final_score[idx], 3)
            })
        return results
