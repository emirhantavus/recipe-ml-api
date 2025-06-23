import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function LastVisit() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get("users/last-viewed/")
      .then((res) => {
        if (Array.isArray(res.data.results)) {
          setRecipes(res.data.results);
        } else if (Array.isArray(res.data)) {
          setRecipes(res.data);
        } else {
          setRecipes([]);
        }
      })
      .catch((err) => {
        console.error("Son ziyaret edilenler:", err);
        setRecipes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6">
      <div className="max-w-7xl mx-auto mb-8 space-y-4 bg-white p-6 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">
          Last Visited Recipes
        </h1>
      </div>

      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : !Array.isArray(recipes) || recipes.length === 0 ? (
        <div className="text-center text-gray-500">
          Henüz hiç tarif ziyaret edilmedi.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {recipes.map((r) => {
            const imgUrl =
              r.image && r.image.startsWith("http")
                ? r.image
                : "/assets/default.jpg";

            return (
              <div
                key={r.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition duration-300"
              >
                <img
                  src={imgUrl}
                  alt={r.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex flex-col justify-between">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {r.title}
                  </h2>
                  <Link
                    to={`/recipes/${r.id}`}
                    className="mt-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-center"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
