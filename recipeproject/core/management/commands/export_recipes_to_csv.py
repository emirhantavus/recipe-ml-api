import csv
from django.core.management.base import BaseCommand
from core.models import Recipe

class Command(BaseCommand):
    help = "Export all recipes and ingredients to a CSV file (with meal_type)"

    def handle(self, *args, **options):
        with open("recipes_export.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["title", "ingredients", "meal_type"])
            for recipe in Recipe.objects.all():
                ingredients = ", ".join([i.ingredient.name for i in recipe.ingredients.all()])
                meal_type = getattr(recipe, "meal_type", "")
                writer.writerow([recipe.title, ingredients, meal_type])
        self.stdout.write(self.style.SUCCESS("recipes_export.csv dosyası oluşturuldu."))
