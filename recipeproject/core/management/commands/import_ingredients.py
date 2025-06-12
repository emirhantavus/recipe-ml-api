#Csv dosyasından malzeme verilerini veritabanına otamatik eklemek için
from django.core.management.base import BaseCommand
from core.models import Ingredient
import csv

class Command(BaseCommand):
    help = "Import ingredients from CSV"

    def handle(self, *args, **kwargs):
        with open("ingredients.csv", "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                name = row["name"].strip().lower()
                obj, created = Ingredient.objects.get_or_create(name=name)
                if created:
                    count += 1
            self.stdout.write(self.style.SUCCESS(f"{count} ingredient(s) imported!"))
