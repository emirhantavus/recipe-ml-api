import os
import csv
import json
from django.conf import settings
from django.core.management.base import BaseCommand
from core.serializers import RecipeSerializer
from core.models import Ingredient

class Command(BaseCommand):
    help = "Load recipes from CSV and insert into DB"

    def handle(self, *args, **kwargs):
        # CSV dosya yolu
        path = os.path.join(settings.BASE_DIR, "turkish_recipes_50_utf8.csv")

        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR("CSV dosyası bulunamadı. Dosya yolu hatalı mı?"))
            return

        with open(path, encoding="utf-8-sig") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    ingredients_data = json.loads(row["ingredients"])
                    recipe_data = {
                        "title": row["title"],
                        "description": row["description"],
                        "instructions": row["instructions"],
                        "prep_time": int(row["prep_time"]),
                        "cook_time": int(row["cook_time"]),
                        "servings": int(row["servings"]),
                        "ingredients": ingredients_data,
                    }

                    serializer = RecipeSerializer(data=recipe_data)
                    if serializer.is_valid():
                        serializer.save()
                        self.stdout.write(self.style.SUCCESS(f"{row['title']} eklendi."))
                    else:
                        self.stdout.write(self.style.WARNING(f"Hatalı tarif: {serializer.errors}"))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"⚠️ {row.get('title', 'Bilinmeyen')} yüklenemedi: {str(e)}"))
