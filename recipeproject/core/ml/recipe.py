import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv_path = os.path.join(BASE_DIR, "ml", "recipes_export_clean.csv")
model_path = os.path.join(BASE_DIR, "ml", "recipe_model.pkl")

df = pd.read_csv(csv_path)
df["ingredients"] = df["ingredients"].fillna("")

ingredient_vectorizer = TfidfVectorizer()
ingredient_matrix = ingredient_vectorizer.fit_transform(df["ingredients"])

with open(model_path, "wb") as f:
    pickle.dump({
        "df": df,
        "ingredient_vectorizer": ingredient_vectorizer,
        "ingredient_matrix": ingredient_matrix,
    }, f)

print("Model başarıyla eğitildi ve kaydedildi:", model_path)
