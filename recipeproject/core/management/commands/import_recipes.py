import csv
import os
import re

from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Recipe, Ingredient, RecipeIngredient

class Command(BaseCommand):
    help = "Imports recipes from recipes.csv and creates Recipe and RecipeIngredient entries."

    def handle(self, *args, **options):
        # Csv doyası projenin ana dizininde olmalı
        file_path = os.path.join(settings.BASE_DIR, 'recipes.csv')
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"CSV dosyası bulunamadı: {file_path}"))
            return

        created_recipes = []
        skipped_recipes = [] 
        missing_ingredients = []

        with open(file_path, newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader, None)
            # Başlık(header) kaçıncı sütünda olduğunu eşleştirmek
            header_map = {}
            if headers:
                for idx, header in enumerate(headers):#hem sütün adı hem indexini alır.
                    key = header.strip().lower().replace(' ', '_')
                    header_map[key] = idx

            for row in reader:
                #boş satırları geç
                if not row or not any(row):
                    continue

                # kullanılacak alanları başlangıçta boş tanımladık.
                title = ""
                prep_time = ""
                cook_time = ""
                ingredients_str = ""
                instructions = ""
                diet_type = ""
                category = ""

                # header_map ile hangi sütün hangi bilgiye karşılık geliyır
                if header_map:
                    title = row[ header_map.get('recipe_name', header_map.get('title', 0)) ].strip()#önce recipe_name arar yoksa title,yoksa 0.sütünü alır.
                    prep_time = row[ header_map.get('prep_time', header_map.get('prep time', 1)) ].strip()
                    cook_time = row[ header_map.get('cook_time', header_map.get('cook time', 2)) ].strip()
                    ingredients_str = row[ header_map.get('ingredients', 3) ].strip() if 'ingredients' in header_map else (row[3].strip() if len(row) > 3 else "")
                    instructions = row[ header_map.get('instructions', 4) ].strip() if 'instructions' in header_map else (row[4].strip() if len(row) > 4 else "")
                    diet_type = row[ header_map.get('diet_type', header_map.get('diet type', 5)) ].strip()
                    category = row[ header_map.get('category', 6) ].strip() if 'category' in header_map else (row[6].strip() if len(row) > 6 else "")
                else:
                    # Header yok ise, her sütünun sırası sabit gibi verileri al
                    title = row[0].strip()
                    prep_time = row[1].strip() if len(row) > 1 else ""
                    cook_time = row[2].strip() if len(row) > 2 else ""
                    ingredients_str = row[3].strip() if len(row) > 3 else ""
                    instructions = row[4].strip() if len(row) > 4 else ""
                    diet_type = row[5].strip() if len(row) > 5 else ""
                    category = row[6].strip() if len(row) > 6 else ""

                # If first field was numeric ID, adjust fields
                if title.isdigit() and len(row) > 1:
                    title = row[1].strip()
                    prep_time = row[2].strip() if len(row) > 2 else ""
                    cook_time = row[3].strip() if len(row) > 3 else ""
                    ingredients_str = row[4].strip() if len(row) > 4 else ""
                    instructions = row[5].strip() if len(row) > 5 else ""
                    diet_type = row[6].strip() if len(row) > 6 else ""
                    category = row[7].strip() if len(row) > 7 else ""

                # süre değerlerini int çevir.
                try:
                    prep_time_val = int(prep_time)
                except Exception:
                    prep_time_val = None
                try:
                    cook_time_val = int(cook_time)
                except Exception:
                    cook_time_val = None

                # meal_type belirleme
                meal_type_val = category if category else 'main'

                #Tarif daha önce eklenmiş mi
                if Recipe.objects.filter(title__iexact=title).exists():
                    skipped_recipes.append(title)#eklenmiş ise
                    continue

                # Yeni tarif oluşturma
                recipe = Recipe.objects.create(
                    title=title,
                    prep_time=prep_time_val,
                    cook_time=cook_time_val,
                    description=instructions,
                    diet_type=diet_type,
                    meal_type=meal_type_val,
                    servings=4
                )
                created_recipes.append(recipe)

                #Malzeme listesini (virgüllerle ayrılanları) tek tek alır
                ingredient_names = [ing.strip() for ing in ingredients_str.split(',') if ing.strip()]

                for ing_name in ingredient_names:
                    #Malzeme adı varsa parantez içi temizlenir,küçük harfe çevrilir.
                    ing_clean = re.sub(r'\(.*?\)', '', ing_name).strip().lower()
                    if not ing_clean:
                        continue
                    try:#Malzeme varsa objesi alınır.
                        ingredient_obj = Ingredient.objects.get(name__iexact=ing_clean)
                    except Ingredient.DoesNotExist:#veritabında mazleme yoksa missing_ingredients listesine eklenir.
                        missing_ingredients.append((title, ing_clean))
                        continue
                    except Ingredient.MultipleObjectsReturned:#birden fazla varsa
                        ingredient_obj = Ingredient.objects.filter(name__iexact=ing_clean).first()

                    # ingredient ve recipe ilişki kuruldu
                    RecipeIngredient.objects.create(
                        recipe=recipe,
                        ingredient=ingredient_obj,
                        amount=1,
                        unit=""
                    )

        # Output çıktıları
        self.stdout.write("İçe aktarma tamamlandı.")
        if created_recipes:
            self.stdout.write("Başarıyla oluşturulan tarifler:")
            for rec in created_recipes:
                self.stdout.write(f"- {rec.title}")
        if skipped_recipes:
            self.stdout.write("Atlanan tarifler (zaten var):")
            for title in skipped_recipes:
                self.stdout.write(f"- {title}")
        if missing_ingredients:
            self.stdout.write("Bulunamayan malzemeler:")
            for title, ing in missing_ingredients:
                self.stdout.write(f"- Tarif '{title}': '{ing}'")
