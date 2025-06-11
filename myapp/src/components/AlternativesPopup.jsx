import React from "react";
import { useNavigate } from "react-router-dom";

function AlternativesPopup({
  missingIngredients,
  recipeTitle,
  onSuggestAlternatives,
  onRemoveMissing,
  onClose,
}) {
  const navigate = useNavigate();

  const handleGoToShoppingList = () => {
    const newEntry = {
      recipe: recipeTitle,
      items: missingIngredients.map(item => item.ingredient_name),
    };
    const list = JSON.parse(localStorage.getItem('shoppingList')) || [];
    const index = list.findIndex(entry => entry.recipe === newEntry.recipe);
    if (index !== -1) {
      const combined = Array.from(new Set([...list[index].items, ...newEntry.items]));
      list[index] = { recipe: recipeTitle, items: combined };
    } else {
      list.push(newEntry);
    }
    localStorage.setItem('shoppinglist', JSON.stringify(list));
    navigate("/shoppinglist");
  };

  return (
    <div className="fixed top-24 right-8 z-50 bg-purple-50 border border-purple-200 rounded-2xl shadow-xl w-80 p-6 transition-all duration-300">
      <div className="font-bold text-purple-700 text-lg mb-3 text-center">
        Missing Ingredients
      </div>
      {missingIngredients.length === 0 ? (
        <div className="text-gray-400 mb-2 text-center">No missing ingredients!</div>
      ) : (
        <ul>
          {missingIngredients.map((item) => (
            <li
              key={item.ingredient_name}
              className="flex justify-between items-center mb-3 bg-white/80 rounded-lg px-3 py-2 shadow-sm"
            >
              <span className="text-purple-700">{item.ingredient_name}</span>
              <button
                className="text-gray-400 hover:text-red-400 ml-2 text-xl transition"
                title="Remove from list"
                onClick={() => onRemoveMissing(item)}
                type="button"
              >
                &#10006;
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-col gap-3">
        <button
          className="bg-green-400 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg border border-green-500 flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleGoToShoppingList}
          type="button"
          disabled={missingIngredients.length === 0}
        >
          <span role="img" aria-label="shopping cart">🛒</span>
          Add All to Shopping List
        </button>
        <button
          className="bg-blue-400 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg border border-blue-500 flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={onSuggestAlternatives}
          type="button"
          disabled={missingIngredients.length === 0}
        >
          <span role="img" aria-label="lightbulb">💡</span>
          Suggest Alternatives
        </button>
        <button
          className="mt-2 text-xs text-gray-400 hover:text-purple-700"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default AlternativesPopup;

