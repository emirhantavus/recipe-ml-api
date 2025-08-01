import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";

function RecipeFinder() {
  const [mealTypes, setMealTypes] = useState([{ value: "", label: "All Meal Types" }]);
  const [mealType, setMealType] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    API.get("recipes/mealtypes/").then(res => {
      const opts = res.data.map(mt => ({
        value: mt.id,
        label: mt.name
      }));
      setMealTypes([{ value: "", label: "All Meal Types" }, ...opts]);
    });
  }, []);

  const addIngredient = (e) => {
    e.preventDefault();
    const newIngredients = input
      .split(",")
      .map(i => i.trim().toLowerCase())
      .filter(Boolean)
      .filter(i => !ingredients.includes(i));
    if (newIngredients.length > 0) {
      setIngredients([...ingredients, ...newIngredients]);
      setInput("");
    }
  };

  const suggestRecipes = async () => {
    if (ingredients.length < 3) return;
    try {
      const payload = { ingredients };
      if (mealType) payload.meal_type = mealType;
      const res = await API.post("recipes/ml-recommend/", payload);
      setResults(res.data.recommendations);
    } catch (err) {
      console.error("API error:", err);
    }
  };

  function getImageUrl(img) {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">AI-Based Recipe Finder</h1>

        <div className="mb-6">
          <label className="block mb-2 font-semibold">Category (Meal Type)</label>
          <select
            value={mealType}
            onChange={e => setMealType(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:border-purple-600"
          >
            {mealTypes.map(mt => (
              <option key={mt.value} value={mt.value}>{mt.label}</option>
            ))}
          </select>
        </div>

        <form onSubmit={addIngredient} className="flex space-x-2 mb-6">
          <input
            type="text"
            placeholder="Add an ingredient"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-purple-600 text-white px-4 rounded">Add</button>
        </form>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Ingredients:</h2>
          {ingredients.length === 0 ? (
            <p className="text-gray-500">No ingredients added.</p>
          ) : (
            <ul className="space-y-2">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded">
                  {ing}
                  <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="text-red-600">X</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={suggestRecipes}
          className="w-full bg-green-600 text-white py-2 rounded text-lg"
          disabled={ingredients.length < 3}
          style={{ opacity: ingredients.length < 3 ? 0.5 : 1 }}
        >
          Suggest Recipes
        </button>
        
        {ingredients.length < 3 && (
          <div className="text-red-600 font-bold mt-2 text-center">
            Please enter at least 3 ingredients to get recipe suggestions.
          </div>
        )}

        <div className="mt-10 space-y-4">
          {results.map((rec) => {
            const missingIngredientsArr = rec.missing_ingredients
              ? Array.isArray(rec.missing_ingredients)
                ? rec.missing_ingredients
                : typeof rec.missing_ingredients === "string"
                  ? rec.missing_ingredients.split(",").map(s => s.trim()).filter(Boolean)
                  : []
              : [];
            const imageUrl = getImageUrl(rec.image);

            return (
              <div key={rec.title} className="bg-gray-100 p-4 rounded shadow">
                <div className="flex gap-4 items-center">
                  {imageUrl && (
                    <img src={imageUrl} alt={rec.title} className="w-24 h-24 object-cover rounded" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{rec.title}</h3>
                    <p className="text-sm text-gray-600">Ingredients: {rec.ingredients}</p>
                    {missingIngredientsArr.length > 0 && (
                      <p className="text-sm font-bold text-red-600">
                        Missing: {missingIngredientsArr.join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">Score: {rec.score}</p>
                    {rec.id && (
                      <Link
                        to={`/recipes/${rec.id}?missingIngredients=${encodeURIComponent(missingIngredientsArr.join(","))}`}
                        className="inline-block mt-2 text-purple-700 underline font-semibold"
                      >
                        View Recipe
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RecipeFinder;
