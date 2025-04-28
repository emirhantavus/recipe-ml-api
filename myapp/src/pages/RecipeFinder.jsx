import { useState } from "react";

function RecipeFinder() {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");

  const addIngredient = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      setIngredients([...ingredients, input.trim()]);
      setInput("");
    }
  };

  const suggestRecipes = () => {
    console.log("Suggesting recipes for:", ingredients);
    // Burada API isteği yapılacak!
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
          Suggest Recipes
        </button>
      )}
    </div>
  );
}

export default RecipeFinder;
