import { Link } from "react-router-dom";

function Recipes() {
  const recipes = [
    { id: 1, title: "Karnıyarık", image: "/assets/karnıyarık.jpg" },
    { id: 2, title: "Mercimek Çorbası", image: "/assets/mercimek.jpg" },
    { id: 3, title: "Baklava", image: "/assets/baklava.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition duration-300"
          >
            {/* Tarif Görseli */}
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />

            {/* Tarif Bilgileri */}
            <div className="p-6 flex flex-col justify-between">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{recipe.title}</h2>

              {/* DÜZELTİLMİŞ Link */}
              <Link
                to={`/recipes/${recipe.id}`} // 🔥 Burada plural! (/recipes/)
                className="mt-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-center transition"
              >
                View Recipe
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recipes;