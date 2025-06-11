
// login olmuş kullanıcıların görebleceği sayfaları korumak için kullanılır.
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PrivateRoute({ children }) {//dışarıdan gelen içerik--children olur
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/signin" />;
}

export default PrivateRoute;
