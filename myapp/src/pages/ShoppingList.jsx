import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import API from '../api/api';

function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const res = await API.get("recipes/shoppinglist/");
        setShoppingList(res.data);
      } catch (error) {
        setShoppingList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShoppingList();
  }, []);

  const removeRecipe = async (itemId) => {
    try {
      await API.delete(`recipes/shoppinglist/${itemId}/`);
      setShoppingList(list => list.filter(item => item.id !== itemId));
    } catch {}
  };

  const removeItem = async (itemId, itemToRemove) => {
    const item = shoppingList.find(e => e.id === itemId);
    if (!item) return;
    const newIngredients = item.missing_ingredients.filter(i => i !== itemToRemove);
    if (newIngredients.length === 0) {
      await removeRecipe(itemId);
      return;
    }
    try {
      await API.patch(`/recipes/shoppinglist/${itemId}/`, {
        missing_ingredients: newIngredients,
      });
      setShoppingList(list =>
        list.map(e =>
          e.id === itemId ? { ...e, missing_ingredients: newIngredients } : e
        )
      );
    } catch {}
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading shopping list...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bcc0e5] to-white">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-200 to-blue-300 text-black px-6 py-2 rounded shadow">
            My Shopping List
          </h1>
        </div>
        {(shoppingList.length === 0) ? (
          <p className="text-center text-gray-500">
            There are no recipes or ingredients in your shopping list.
          </p>
        ) : (
          <div className="grid gap-8">
            {shoppingList.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-bold text-purple-700">{entry.recipe_title}</div>
                  <button
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Remove recipe"
                    onClick={() => removeRecipe(entry.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <ul className="space-y-2">
                  {Array.isArray(entry.missing_ingredients) && entry.missing_ingredients.length > 0 ? (
                    entry.missing_ingredients.map((item, i) => (
                      <li key={i} className="flex justify-between items-center border-b pb-1">
                        <span>{item}</span>
                        <button
                          className="text-red-400 hover:text-red-700 ml-2 text-xs"
                          onClick={() => removeItem(entry.id, item)}
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">
                      No ingredients for this recipe.
                    </li>
                  )}
                </ul>
                <div className="text-xs text-gray-500 mt-2">
                  Added: {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingListPage;