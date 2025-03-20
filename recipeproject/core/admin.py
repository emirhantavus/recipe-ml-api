from django.contrib import admin
from .models import Recipe, Ingredient, RecipeIngredient, IngredientAlternative

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("title", "prep_time", "cook_time", "servings")
    search_fields = ("title", "description")
    list_filter = ("prep_time", "cook_time")
    ordering = ("title",)

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

admin.site.register(RecipeIngredient)
admin.site.register(IngredientAlternative)
