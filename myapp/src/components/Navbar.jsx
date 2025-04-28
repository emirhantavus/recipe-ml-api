import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";


function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/signin");
  };

  return (
    <nav
      className="h-16 flex justify-between items-center px-4 text-white"
      style={{ backgroundColor: "#afbbf2" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center h-full">
        <div className="h-14 w-auto flex items-center justify-center">
        <img src="/assets/logo.png" alt="SmartChef Logo" className="h-full w-auto object-contain" />

        </div>
      </Link>

      {/* NAV LINKS - Sağda kalacak ama sola biraz yaklaşacak */}
      <div className="flex space-x-4 items-center mr-4">
        <Link to="/recipes" className="hover:bg-purple-700 font-bold" title="View all available recipes">
          Recipes
        </Link>
        <Link to="/recipefinder" className="hover:bg-purple-700  font-bold" title="Find recipes based on your ingredients">
          Recipe Finder
        </Link>

        {user ? (
          <button
            onClick={handleLogout}
            className="hover:underline"
            title="Sign out from your account"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/signin" className="hover:bg-purple-700 font-bold  " title="Sign in to your account">
              Sign In
            </Link>
            <Link to="/signup" className="hover:bg-purple-700  font-bold" title="Create a new account">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
