import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

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
  const [alternatives, setAlternatives] = useState(null);
  const [altLoading, setAltLoading] = useState(false);

  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingRating, setEditingRating] = useState("");

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
        setCurrentUser(res.data.username);
      } catch (err) {}
    };
    fetchRecipe();
    checkIfFavorite();
    fetchUser();
  }, [id]);

  // Eksik malzemeler varsa, alternatifleri otomatik getir
  useEffect(() => {
    const fetchAlternatives = async () => {
      if (missingIngredients.length > 0) {
        setAltLoading(true);
        try {
          const res = await API.post("recipes/ingredient-alternative-llm/", {
            ingredients: missingIngredients.map(item => item.ingredient_name),
            recipe_id: id,
          });
          setAlternatives(res.data.alternatives);
        } catch (err) {
          setAlternatives(null);
        } finally {
          setAltLoading(false);
        }
      }
    };
    fetchAlternatives();
    // eslint-disable-next-line
  }, [missingIngredients, id]);

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

  const handleGoToShoppingList = async () => {
    if (!missingIngredients.length) return;
    try {
      await API.post("recipes/shoppinglist/", {
        recipe_title: recipe.title,
        missing_ingredients: missingIngredients.map(item => item.ingredient_name),
      });
      window.location.href = "/shoppinglist";
    } catch (error) {
      alert("Failed to add to shopping list!");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSending(true);
    setCommentError("");
    try {
      await API.post(`recipes/${id}/reviews/`, {
        comment: newComment,
        rating: newRating !== "" ? newRating : null,
      });
      const res = await API.get(`recipes/${id}/`);
      setRecipe(res.data);
      setShowCommentBox(false);
    } catch (err) {
      setCommentError("Failed to submit comment or rating.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      await API.put(`recipes/reviews/${reviewId}/`, {
        comment: editingComment,
        rating: editingRating !== "" ? editingRating : null,
      });
      const res = await API.get(`recipes/${id}/`);
      setRecipe(res.data);
      setEditingReviewId(null);
    } catch (err) {
      alert("Comment isn't updated");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you wanna delete")) return;
    try {
      await API.delete(`recipes/reviews/${reviewId}/`);
      const res = await API.get(`recipes/${id}/`);
      setRecipe(res.data);
      setEditingReviewId(null);
    } catch (err) {
      alert("Comment not deleted!");
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
    <div className="min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white py-12 px-6 flex flex-col md:flex-row gap-8">
      {/* SOL ANA BLOK */}
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
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

        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Comments & Ratings</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-yellow-500 text-xl font-bold">
              ★ {recipe.average_rating || 0}
            </span>
            <span className="text-gray-500">({recipe.review_count || 0} reviews)</span>
          </div>

          <button
            className="mb-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            onClick={() => setShowCommentBox((prev) => !prev)}
          >
            {showCommentBox ? "Close" : "Comment/Rate"}
          </button>

          {showCommentBox && (
            <form onSubmit={handleSubmitComment} className="mb-8 flex flex-col gap-3">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full p-2 border rounded min-h-[60px] resize-y"
                placeholder="Add your comment (optional)"
                disabled={sending}
              />
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700">Your Rating:</label>
                <select
                  value={newRating}
                  onChange={e => setNewRating(e.target.value)}
                  className="p-1 border rounded"
                  disabled={sending}
                >
                  <option value="">Seçiniz</option>
                  {[5, 4, 3, 2, 1].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  disabled={sending || (!newComment && newRating === "")}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              {commentError && <div className="text-red-500">{commentError}</div>}
            </form>
          )}

          <div className="space-y-4">
            {recipe.reviews && recipe.reviews.filter(r => r.comment && r.comment.trim() !== "").length > 0 ? (
              recipe.reviews.filter(r => r.comment && r.comment.trim() !== "").map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-50 p-4 rounded-lg shadow flex flex-col gap-2 group relative"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-800">{r.user}</span>
                    {r.rating && <span className="text-yellow-500">★ {r.rating}</span>}
                    <span className="text-gray-400 text-xs ml-auto">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    {currentUser === r.user && (
                      <>
                        <button
                          className="ml-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => {
                            setEditingReviewId(r.id);
                            setEditingComment(r.comment);
                            setEditingRating(r.rating !== null ? r.rating : "");
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
                      />
                      <select
                        value={editingRating}
                        onChange={e => setEditingRating(e.target.value)}
                        className="p-1 border rounded w-24"
                      >
                        <option value="">Seçiniz</option>
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

      {/* SAĞ SABİT ALTERNATİF KUTUSU */}
      {missingIngredients.length > 0 && (
        <div className="md:sticky md:top-24 md:self-start w-full md:w-96 bg-purple-50 border border-purple-200 rounded-2xl shadow-xl p-6 h-fit flex flex-col gap-2">
          <div className="font-bold text-purple-700 text-xl mb-2 text-center">
            Missing Ingredients
          </div>
          <ul>
            {missingIngredients.map((item) => (
              <li
                key={item.ingredient_name}
                className="flex justify-between items-center mb-3 bg-white/80 rounded-lg px-3 py-2 shadow-sm"
              >
                <span className="text-purple-700">{item.ingredient_name}</span>
              </li>
            ))}
          </ul>
          {altLoading ? (
            <div className="text-center text-gray-400 py-2">Loading suggestions...</div>
          ) : alternatives && (
            <div className="mt-4">
              <div className="font-semibold text-purple-700 mb-2">Alternative Suggestions</div>
              {Object.entries(alternatives).map(([ingredient, alts]) => (
                <div key={ingredient} className="mb-3">
                  <b className="text-sm">{ingredient}</b>
                  <ul className="list-disc list-inside text-gray-700 pl-4">
                    {(typeof alts === "string" &&
                      (
                        alts.toLowerCase().includes("no suitable alternative") ||
                        alts.toLowerCase().includes("no alternative")
                      )
                    )
                      ? <li className="text-gray-400">{alts}</li>
                      : alts.split(",").map((alt, i) => (
                          <li key={i}>{alt.trim()}</li>
                        ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <button
            className="mt-3 bg-green-400 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg border border-green-500 flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={handleGoToShoppingList}
            type="button"
            disabled={missingIngredients.length === 0}
          >
            <span role="img" aria-label="shopping cart">🛒</span>
            Add All to Shopping List
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeDetail;
