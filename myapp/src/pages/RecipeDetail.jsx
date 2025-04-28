import { useParams, Link } from "react-router-dom";
import { useState } from "react";

function RecipeDetail() {
  const { id } = useParams();

  const recipes = [
    {
      id: "1",
      title: "Karnıyarık",
      image: "/assets/karniyarik.jpg",
      description: "Eggplants stuffed with minced meat and spices, baked to perfection.",
      ingredients: ["Eggplant", "Minced Meat", "Onion", "Garlic", "Tomato", "Parsley"],
      steps: [
        "Cut the eggplants and fry them lightly.",
        "Prepare the minced meat filling.",
        "Stuff the eggplants and bake in the oven.",
      ],
      preparationTime: "1 hour",
      calories: "450 kcal",
    },
    {
      id: "2",
      title: "Mercimek Çorbası",
      image: "/assets/mercimek.jpg",
      description: "A hearty Turkish lentil soup, perfect for any season.",
      ingredients: ["Red Lentils", "Onion", "Carrot", "Potato", "Butter", "Paprika"],
      steps: [
        "Boil the lentils and vegetables together.",
        "Blend the mixture until smooth.",
        "Top with melted butter and paprika before serving.",
      ],
      preparationTime: "40 minutes",
      calories: "320 kcal",
    },
    {
      id: "3",
      title: "Baklava",
      image: "/assets/baklava.jpg",
      description: "Traditional Turkish dessert made with layers of filo pastry and nuts, soaked in syrup.",
      ingredients: ["Phyllo Dough", "Pistachios", "Butter", "Sugar", "Water", "Lemon Juice"],
      steps: [
        "Layer the phyllo dough with butter and nuts.",
        "Bake until golden and crispy.",
        "Pour cold syrup over hot baklava and let it soak.",
      ],
      preparationTime: "1.5 hours",
      calories: "600 kcal",
    },
  ];

  const recipe = recipes.find((r) => r.id === id);

  const [saved, setSaved] = useState(false);

  const handleSaveFavorite = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">

        {/* 🔥 FOTOĞRAF EKLENDİ */}
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full max-h-96 object-cover rounded-lg mb-8 shadow-md"
        />

        {/* Başlık */}
        <h1 className="text-4xl font-bold text-purple-700 mb-6">{recipe.title}</h1>

        {/* Ekstra Bilgiler */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 text-gray-600 w-full">
          <div><strong>Preparation Time:</strong> {recipe.preparationTime}</div>
          <div><strong>Calories:</strong> {recipe.calories}</div>
        </div>

        {/* Açıklama */}
        <p className="text-gray-600 mb-8">{recipe.description}</p>

        {/* Malzemeler */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
        <ul className="list-disc list-inside mb-8 text-gray-600 space-y-2">
          {recipe.ingredients.map((item, index) => (
            <li
              key={index}
              className="transition-transform transform hover:scale-105 hover:text-purple-600 duration-300"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Hazırlık Adımları */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Preparation Steps</h2>
        <ol className="list-decimal list-inside text-gray-600 space-y-2">
          {recipe.steps.map((step, index) => (
            <li
              key={index}
              className="transition-transform transform hover:scale-105 hover:text-purple-600 duration-300"
            >
              {step}
            </li>
          ))}
        </ol>

        {/* Butonlar */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 w-full">
          <Link
            to="/recipes"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            ← Back to Recipes
          </Link>

          <button
            onClick={handleSaveFavorite}
            className={`inline-block ${saved ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-2 px-6 rounded-lg transition`}
          >
            {saved ? "Saved!" : "Save to Favorites ❤️"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default RecipeDetail;
