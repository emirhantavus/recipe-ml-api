import django_filters
from .models import Recipe

class RecipeFilter(django_filters.FilterSet):
      title = django_filters.CharFilter(lookup_expr='icontains')
      prep_time = django_filters.NumberFilter()
      prep_time__lte = django_filters.NumberFilter(field_name="prep_time", lookup_expr='lte')
      cook_time__gte = django_filters.NumberFilter(field_name="cook_time", lookup_expr='gte')
      ingredient = django_filters.CharFilter(method='filter_by_ingredient')
       
      class Meta:
            model = Recipe
            fields = ['title', 'prep_time', 'prep_time__lte', 'cook_time__gte', 'ingredient']
                
      def filter_by_ingredient(self, queryset, value):
            return queryset.filter(ingredients__ingredient__name__icontains=value)
