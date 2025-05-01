import { useState } from "react";
import API from "../api/api"; // 🔥 axios değil, kendi ayarladığın API
import { Link } from "react-router-dom";

function RecipeFinder() {
  const [queryTitle, setQueryTitle] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  const addIngredient = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      setIngredients([...ingredients, input.trim().toLowerCase()]);
      setInput("");
    }
  };

  const suggestRecipes = async () => {
    try {
      const res = await API.post("recipes/ml-recommend/", {
        title: queryTitle,
        ingredients,
        alpha: 0.6,
      });
      setResults(res.data.recommendations);
    } catch (err) {
      console.error("API hatası:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Based Recipe Finder</h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Recipe Title (Optional)</label>
        <input
          type="text"
          value={queryTitle}
          onChange={(e) => setQueryTitle(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-purple-600"
          placeholder="e.g. Pilaf, Soup..."
        />
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

      {(ingredients.length > 0 || queryTitle.trim() !== "") && (
        <button onClick={suggestRecipes} className="w-full bg-green-600 text-white py-2 rounded text-lg">
          Suggest Recipes
        </button>
      )}

      <div className="mt-10 space-y-4">
        {results.map((rec) => (
          <div key={rec.title} className="bg-gray-100 p-4 rounded shadow">
            <div className="flex gap-4 items-center">
              <img src={rec.image || "/assets/default.jpg"} alt={rec.title} className="w-24 h-24 object-cover rounded" />
              <div>
                <h3 className="text-xl font-bold">{rec.title}</h3>
                <p className="text-sm text-gray-600">Ingredients: {rec.ingredients}</p>
                {rec.missing_ingredients && rec.missing_ingredients.length > 0 && (
                  <p className="text-sm text-red-600">Missing: {rec.missing_ingredients}</p>
                )}
                <p className="text-sm text-gray-700">Score: {rec.score}</p>
                {rec.id && (
                  <Link to={`/recipes/${rec.id}`} className="inline-block mt-2 text-purple-700 underline">View Recipe</Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeFinder;
