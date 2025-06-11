import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("users/favorites/")
      .then((res) => {
        setFavorites(res.data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Favoriler alınamadı:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading favorites...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Favorite Recipes</h1>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">No favorite recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((recipe) => (
            <Link
              to={`/recipes/${recipe.id}`}
              key={recipe.id}
              className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition cursor-pointer block"
            >
              <img
                src={recipe.image || "/assets/default.jpg"}
                alt={recipe.title}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                <strong>Prep:</strong> {recipe.prep_time} min | <strong>Cook:</strong> {recipe.cook_time} min | <strong>Servings:</strong> {recipe.servings}
              </p>
              <ul className="text-sm text-gray-700">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>• {ing.amount} {ing.unit} {ing.ingredient_name}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
