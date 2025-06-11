import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import AlternativesPopup from "../components/AlternativesPopup";

function RecipeDetail() {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const missingIngredientsStr = searchParams.get("missingIngredients") || "";
  const missingIngredientsList = missingIngredientsStr
    ? missingIngredientsStr.split(",").map(str => str.trim().toLowerCase()).filter(Boolean)
    : [];

  const [missingIngredients, setMissingIngredients] = useState(
    missingIngredientsList.map(ingredient_name => ({ ingredient_name }))
  );

  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  //const [cart, setCart] = useState([]);

  const apiHost = API.defaults.baseURL.replace(/\/api\/$/, "");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await API.get(`recipes/${id}/`);
        setRecipe(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Could not fetch recipe:", err);
        setLoading(false);
      }
    };

    const checkIfFavorite = async () => {
      try {
        const res = await API.get("users/profile/");
        const favs = res.data.favorite_recipes || [];
        const exists = favs.some(r => r.id === parseInt(id));
        setIsFavorite(exists);
      } catch (err) {
        console.error("Could not check favorites:", err);
      }
    };

    fetchRecipe();
    checkIfFavorite();
  }, [id]);

  const handleToggleFavorite = async () => {
    setProcessing(true);
    try {
      setIsFavorite(prev => !prev);
      await API.post(`users/favorites/${id}/add/`);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setIsFavorite(prev => !prev);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuggestAlternatives = () => {
    const altList = missingIngredients
      .map(item => `${item.ingredient_name}: chia seeds (example)`)
      .join("\n");
    alert("Suggested alternatives:\n" + altList);
  };

  const handleRemoveMissing = (itemToRemove) => {
    setMissingIngredients((prev) =>
      prev.filter((item) => item.ingredient_name !== itemToRemove.ingredient_name)
    );
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-500">Recipe Not Found</h1>
        <Link
          to="/recipes"
          className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          ← Back to Recipes
        </Link>
      </div>
    );
  }

  const imageUrl = recipe.image
    ? `${apiHost}${recipe.image}`
    : "/assets/default.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full max-h-96 object-cover rounded-lg mb-8 shadow-md"
        />

        <h1 className="text-4xl font-bold text-purple-700 mb-6">{recipe.title}</h1>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 text-gray-600 w-full">
          <div><strong>Preparation Time:</strong> {recipe.prep_time} min</div>
          <div><strong>Cooking Time:</strong> {recipe.cook_time} min</div>
          <div><strong>Servings:</strong> {recipe.servings}</div>
        </div>

        <p className="text-gray-600 mb-8">{recipe.description}</p>

        {/* Missing Ingredients Button & Popup */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={() => setShowPopup(true)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-4 py-2 rounded-lg shadow font-semibold transition"
            type="button"
          >
            Missing Ingredients
          </button>
        </div>
        {showPopup && (
          <AlternativesPopup
            missingIngredients={missingIngredients}
            recipeTitle={recipe.title} // buradan başlık geçiyoruz!
            onSuggestAlternatives={handleSuggestAlternatives}
            onRemoveMissing={handleRemoveMissing}
            onClose={() => setShowPopup(false)}
          />
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
        <ul className="list-disc list-inside mb-8 text-gray-600 w-full space-y-2">
          {recipe.ingredients.map((item, idx) => (
            <li key={idx}>
              {item.amount} {item.unit} – {item.ingredient_name}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Preparation Steps</h2>
        <ol className="list-decimal list-inside text-gray-600 w-full space-y-2">
          {recipe.instructions.split(".").filter(Boolean).map((step, i) => (
            <li key={i}>{step.trim()}.</li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 w-full">
          <Link
            to="/recipes"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            ← Back to Recipes
          </Link>
          <button
            onClick={handleToggleFavorite}
            disabled={processing}
            className={`inline-block ${
              isFavorite ? "bg-red-500" : "bg-purple-600 hover:bg-purple-700"
            } text-white font-bold py-2 px-6 rounded-lg transition`}
          >
            {processing
              ? "Processing..."
              : isFavorite
              ? "Remove Favorite ❌"
              : "Save to Favorites ❤️"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;

