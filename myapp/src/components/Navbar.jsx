import { useContext } from "react";  //contexteki değerlere erişmek için hook
import { AuthContext } from "../context/AuthContext";  //oturum durumunu saklayan context
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser(); //token silinir
    navigate("/signin");
  };

  return (
    <nav
      className="h-16 flex justify-between items-center px-6 text-white"
      style={{ background: "linear-gradient(90deg, #cdffd8, #94b9ff)", color: "white" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center h-full">
        <div className="h-14 w-auto flex items-center justify-center">
          <img
            src="/assets/logo.png"
            alt="SmartChef Logo"
            className="h-full w-auto object-contain"
          />
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex space-x-6 items-center">
        <Link
          to="/recipes"
          className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
          title="View all available recipes"
        >
          Recipes
        </Link>

        <Link
          to="/recipefinder"
          className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
          title="Find recipes based on your ingredients"
        >
          Recipe Finder
        </Link>

        {user ? (  //eğer kullancıı varsa (koşul)
          <>
            <Link
              to="/profile"
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="View your profile"
            >
              Profile
            </Link>

            <Link
              to="/favorites"
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="View your favorite recipes"
            >
              Favorites
            </Link>

            <Link
              to="/lastvisit"
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="View your favorite recipes"
            >
              Last Visit
            </Link>

            <Link
              to="/shoppinglist"
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="View your shopping list"
            >
              Shopping List
            </Link>

            <button
              onClick={handleLogout}
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="Sign out from your account"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signin"
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="Sign in to your account"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="hover:bg-indigo-500 px-3 py-1 rounded font-bold"
              title="Create a new account"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
