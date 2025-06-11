import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Yeni alan
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile"); // Zaten giriş yapılmışsa yönlendir
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          username: username, // Backend'e gönder
          password: password,
          password2: password2,
        }),
      });

      if (response.ok) {
        alert("Registration successful!");
        navigate("/signin");
      } else {
        const data = await response.json();
        console.error(data);
        alert("Registration failed: " + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 border rounded"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Sign Up
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          {!user && (
            <Link to="/signin" className="text-purple-600 font-medium hover:underline">
              Sign in
            </Link>
          )}
        </p>
      </form>
    </div>
  );
}

export default SignUp;
