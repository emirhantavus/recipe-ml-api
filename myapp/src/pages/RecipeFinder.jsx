import { useState } from "react";
import API from "../api/api";

function RecipeFinder() {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addIngredient = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      setIngredients([...ingredients, input.trim()]);
      setInput("");
    }
  };

  const suggestRecipes = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await API.post("find-recipes/", {
        ingredients: ingredients,
        alpha: 0.5, // veya kullanıcıdan alabilirsin
      });
      setResults(response.data);
    } catch (err) {
      setError("Could not fetch recipes. Please try again.");
      console.error("Recipe suggestion error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Find Recipes Based on Your Ingredients</h1>
      <p className="text-gray-700 mb-6 text-center text-lg">
        Enter the ingredients you have, and we'll suggest delicious recipes you can make!
      </p>

      <form onSubmit={addIngredient} className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="e.g. eggs, tomatoes, cheese"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
        >
          Add
        </button>
      </form>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ingredients:</h2>
        {ingredients.length === 0 ? (
          <p className="text-gray-500">No ingredients added yet.</p>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                {ingredient}
                <button
                  onClick={() => {
                    const newIngredients = [...ingredients];
                    newIngredients.splice(index, 1);
                    setIngredients(newIngredients);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {ingredients.length > 0 && (
        <button
          onClick={suggestRecipes}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-lg"
        >
          {loading ? "Searching..." : "Suggest Recipes"}
        </button>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {results && (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Exact Matches</h2>
            {results.recipes.length > 0 ? (
              results.recipes.map((r, index) => (
                <div key={index} className="bg-green-100 p-4 rounded shadow-sm mb-4">
                  <h3 className="font-semibold text-lg">{r.title}</h3>
                  <p className="text-sm text-gray-700">{r.description}</p>
                  <p className="text-sm mt-2"><strong>Ingredients:</strong> {r.ingredients.join(", ")}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No exact matches found.</p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Suggestions with Alternative Ingredients</h2>
            {results.suggestions.map((s, index) => (
              <div key={index} className="bg-yellow-100 p-4 rounded shadow-sm mb-4">
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-gray-700">{s.description}</p>
                <p className="text-sm mt-2"><strong>Missing:</strong> {s.missing_ingredients.join(", ")}</p>
                {Object.keys(s.alternative_ingredients).length > 0 && (
                  <ul className="text-sm mt-2 space-y-1">
                    {Object.entries(s.alternative_ingredients).map(([missing, alts], i) => (
                      <li key={i}>
                        <strong>{missing}:</strong>{" "}
                        {alts.map((a) => `${a.alternative} (x${a.ratio})`).join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">ML Recommendations</h2>
            {results.ml_recommendations.map((r, index) => (
              <div key={index} className="bg-blue-100 p-4 rounded shadow-sm mb-4">
                <h3 className="font-semibold text-lg">{r.title}</h3>
                <p className="text-sm text-gray-700">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeFinder;
