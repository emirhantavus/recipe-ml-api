import csv
import os
import django

# Django projesini başlat
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recipeproject.settings")
django.setup()

from core.models import Recipe

output_path = "recipes_full.csv"

with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["id", "title", "description", "instructions", "ingredients"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for recipe in Recipe.objects.all():
        ingredients = ", ".join([
            ri.ingredient.name for ri in recipe.ingredients.all()
        ])
        writer.writerow({
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
            "instructions": recipe.instructions,
            "ingredients": ingredients
        })

print(f"✅ Exported {Recipe.objects.count()} recipes to {output_path}")
