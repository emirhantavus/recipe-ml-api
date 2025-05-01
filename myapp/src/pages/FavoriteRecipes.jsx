import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function FavoriteRecipes() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await API.get("users/favorites/");
        setFavorites(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Failed to load favorite recipes");
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (recipeId) => {
    try {
      await API.delete(`users/favorites/${recipeId}/remove/`);
      setFavorites(favorites.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#bcc0e5] to-white py-12 px-6">
        <div className="text-center">
          <div className="inline-block px-6 py-2 rounded animate-pulse bg-gray-200 w-48 h-8"></div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#bcc0e5] to-white py-12 px-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bcc0e5] to-white py-12 px-6">
      <header className="py-10 text-center relative">
        <div
          className="inline-block px-6 py-2 rounded"
          style={{ background: "linear-gradient(90deg, #cdffd8, #94b9ff)", color: "black" }}
        >
          <h1 className="text-4xl font-bold">Favorite Recipes</h1>
        </div>
      </header>

      {favorites.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-xl text-gray-600 mb-4">You haven't added any favorite recipes yet.</p>
          <Link
            to="/recipes"
            className="inline-block px-6 py-2 rounded-full font-semibold shadow"
            style={{ background: "linear-gradient(90deg, #cdffd8, #94b9ff)", color: "black" }}
          >
            Discover Recipes
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
                <Link to={`/recipe/${recipe.id}`}>
                  <img
                    src={`http://127.0.0.1:8000${recipe.image}`}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                      {recipe.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {recipe.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          <i className="fas fa-clock mr-1"></i>
                          {recipe.cooking_time} mins
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          <i className="fas fa-signal mr-1"></i>
                          {recipe.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(recipe.id);
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Remove from favorites"
                      >
                        <i className="fas fa-heart text-xl"></i>
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoriteRecipes;