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
  const [alternatives, setAlternatives] = useState(null);
  const [altLoading, setAltLoading] = useState(false);

  // Yorum yapma
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Kullanıcı ve edit state
  const [currentUser, setCurrentUser] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingRating, setEditingRating] = useState(5);

  const apiHost = API.defaults.baseURL.replace(/\/api\/$/, "");

  useEffect(() => {

    API.post(`users/${id}/visit/`).catch(() => { });
    
    const fetchRecipe = async () => {
      try {
        const res = await API.get(`recipes/${id}/`);
        setRecipe(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    const checkIfFavorite = async () => {
      try {
        const res = await API.get("users/profile/");
        const favs = res.data.favorite_recipes || [];
        const exists = favs.some(r => r.id === parseInt(id));
        setIsFavorite(exists);
      } catch (err) {}
    };
    const fetchUser = async () => {
      try {
        const res = await API.get("users/profile/");
        setCurrentUser(res.data.username); // username veya id dönen key
      } catch (err) {}
    };
    fetchRecipe();
    checkIfFavorite();
    fetchUser();
  }, [id]);

  const handleToggleFavorite = async () => {
    setProcessing(true);
    try {
      setIsFavorite(prev => !prev);
      await API.post(`users/favorites/${id}/add/`);
    } catch (err) {
      setIsFavorite(prev => !prev);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMissing = (itemToRemove) => {
    setMissingIngredients((prev) =>
      prev.filter((item) => item.ingredient_name !== itemToRemove.ingredient_name)
    );
    setAlternatives(null);
  };

  const handleSuggestAlternatives = async () => {
    setAltLoading(true);
    try {
      const res = await API.post("recipes/ingredient-alternative-llm/", {
        ingredients: missingIngredients.map(item => item.ingredient_name),
        recipe_id: recipe.id,
      });
      setAlternatives(res.data.alternatives);
    } catch (err) {
      setAlternatives(null);
    } finally {
      setAltLoading(false);
    }
  };

  // Yorum ekleme
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSending(true);
    setCommentError("");
    try {
      await API.post(`recipes/${id}/reviews/`, {
        comment: newComment,
        rating: newRating,
      });
      const res = await API.get(`recipes/${id}/`);
      setRecipe(res.data);
      setNewComment("");
      setNewRating(5);
      setShowCommentBox(false);
    } catch (err) {
      setCommentError("Failed to submit comment.");
    } finally {
      setSending(false);
    }
  };

  // Yorum güncelleme
  const handleUpdateReview = async (reviewId) => {
    try {
      await API.put(`recipes/reviews/${reviewId}/`, {
        comment: editingComment,
        rating: editingRating,
      });
      const res = await API.get(`recipes/${id}/`);
      setRecipe(res.data);
      setEditingReviewId(null);
    } catch (err) {
      alert("Yorum güncellenemedi!");
    }
  };

  // Yorum silme (opsiyonel)
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Yorumu silmek istediğine emin misin?")) return;
    try {
      await API.delete(`recipes/reviews/${reviewId}/`);
      const res = await API.get(`recipes/${id}/`);
      setRecipe(res.data);
      setEditingReviewId(null);
    } catch (err) {
      alert("Yorum silinemedi!");
    }
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

        {missingIngredients.length > 0 && (
          <div className="w-full flex justify-end mb-4">
            <button
              onClick={() => setShowPopup(true)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-4 py-2 rounded-lg shadow font-semibold transition"
              type="button"
            >
              Missing Ingredients
            </button>
          </div>
        )}
        {showPopup && missingIngredients.length > 0 && (
          <AlternativesPopup
            missingIngredients={missingIngredients}
            recipeTitle={recipe.title}
            recipeId={recipe.id}
            onRemoveMissing={handleRemoveMissing}
            onClose={() => setShowPopup(false)}
            alternatives={alternatives}
            altLoading={altLoading}
            onSuggestAlternatives={handleSuggestAlternatives}
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

        {/* Yorumlar */}
        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Comments & Ratings</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-yellow-500 text-xl font-bold">
              ★ {recipe.average_rating || 0}
            </span>
            <span className="text-gray-500">({recipe.review_count || 0} reviews)</span>
          </div>

          {/* Yorum yap butonu */}
          <button
            className="mb-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            onClick={() => setShowCommentBox((prev) => !prev)}
          >
            {showCommentBox ? "Kapat" : "Yorum Yap"}
          </button>

          {/* Yorum formu */}
          {showCommentBox && (
            <form onSubmit={handleSubmitComment} className="mb-8 flex flex-col gap-3">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full p-2 border rounded min-h-[60px] resize-y"
                placeholder="Add your comment..."
                required
                disabled={sending}
              />
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700">Your Rating:</label>
                <select
                  value={newRating}
                  onChange={e => setNewRating(Number(e.target.value))}
                  className="p-1 border rounded"
                  disabled={sending}
                >
                  {[5, 4, 3, 2, 1].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  disabled={sending || !newComment}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              {commentError && <div className="text-red-500">{commentError}</div>}
            </form>
          )}

          {/* Yorumlar listesi */}
          <div className="space-y-4">
            {recipe.reviews && recipe.reviews.length > 0 ? (
              recipe.reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-50 p-4 rounded-lg shadow flex flex-col gap-2 group relative"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-800">{r.user}</span>
                    <span className="text-yellow-500">★ {r.rating}</span>
                    <span className="text-gray-400 text-xs ml-auto">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    {/* Sadece kendi yorumunda düzenle/sil göster */}
                    {currentUser === r.user && (
                      <>
                        <button
                          className="ml-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => {
                            setEditingReviewId(r.id);
                            setEditingComment(r.comment);
                            setEditingRating(r.rating);
                          }}
                        >
                          Düzenle
                        </button>
                        <button
                          className="ml-1 text-xs text-red-600 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => handleDeleteReview(r.id)}
                        >
                          Sil
                        </button>
                      </>
                    )}
                  </div>
                  {editingReviewId === r.id ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleUpdateReview(r.id);
                      }}
                      className="flex flex-col gap-2"
                    >
                      <textarea
                        value={editingComment}
                        onChange={e => setEditingComment(e.target.value)}
                        className="w-full p-2 border rounded min-h-[60px] resize-y"
                        required
                      />
                      <select
                        value={editingRating}
                        onChange={e => setEditingRating(Number(e.target.value))}
                        className="p-1 border rounded w-24"
                      >
                        {[5, 4, 3, 2, 1].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-2 rounded"
                        >
                          Kaydet
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="bg-gray-300 px-2 rounded"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-gray-800">{r.comment}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400 italic">No comments yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
