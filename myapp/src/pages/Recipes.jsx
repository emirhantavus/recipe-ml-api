import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dietFilter, setDietFilter] = useState("");
  const [mealFilter, setMealFilter] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dietOptions = [
    { value: "", label: "All" },
    { value: "regular", label: "Regular" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten_free", label: "Gluten Free" },
    
  ];

  const mealOptions = [
    { value: "", label: "All" },
    { value: "main", label: "Main Course" },
    { value: "dessert", label: "Dessert" },
    { value: "soup", label: "Soup" },
    { value: "salad", label: "Salad" },
    { value: "side", label: "Side Dish" },
    { value: "breakfast", label: "Breakfast" },
  ];

  const seasonOptions = [
    { value: "", label: "All Seasons" },
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "autumn", label: "Autumn" },
    { value: "winter", label: "Winter" },
  ];

  const fetchRecipes = useCallback(() => {//usecallback---fobk sadece bağımlılıklar değiştirirse baştan oluşturur
    setLoading(true);
    API.get("recipes/recipes/", {
      params: {//Apı gönderilen parametreler
        page: currentPage,
        page_size: 12,
        ordering: "-created_at",
        search: search || undefined,
        diet_type: dietFilter || undefined,
        meal_type: mealFilter || undefined,
        season: seasonFilter || undefined,
      },
    })
      .then((res) => {//istek başarılı ise
        setRecipes(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 12));//Toplam sayfa sayısını state kaydeder
      })
      .catch((err) => console.error("Tarifler alınamadı:", err))
      .finally(() => setLoading(false));
  }, [search, dietFilter, mealFilter, seasonFilter, currentPage]);
  //bağıımlılık dizisi(bunlardan biri değişirse ilgili fonk tekrar çalışır--usecallback sayesinde)

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);// fetch recipe değişirse useEffect çalışsın.Yani tarfileri tekrar backend çeker

  const handlePageChange = (newPage) => {// kullanıcının gitmek istediği sayfa
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);//yeni sayfa numarası
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6">
      <div className="max-w-7xl mx-auto mb-8 space-y-4 bg-white p-6 shadow-lg rounded-lg">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border rounded-lg focus:outline-none focus:border-purple-600"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={dietFilter}
            onChange={(e) => {
              setDietFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border rounded-lg bg-gray-50"
          >
            {dietOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={mealFilter}
            onChange={(e) => {
              setMealFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border rounded-lg bg-gray-50"
          >
            {mealOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={seasonFilter}
            onChange={(e) => {
              setSeasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border rounded-lg bg-gray-50"
          >
            {seasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {recipes.map((r) => {
              const imgUrl = r.image?.startsWith("http")
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

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-purple-500 text-white disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-purple-500 text-white disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
