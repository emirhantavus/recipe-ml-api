import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Eğer yoksa eklemelisin
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import RecipeFinder from "./pages/RecipeFinder";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import ResetPassword from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";

function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/recipefinder" element={<PrivateRoute><RecipeFinder /></PrivateRoute>} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} /> {/* Burada doğru: recipes */}
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRoutes;
