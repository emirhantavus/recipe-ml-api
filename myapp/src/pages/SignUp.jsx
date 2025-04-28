import { useState } from "react";
import { Link } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== password2) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Sign Up with:", { username, email, password });
    // API'ye kayıt isteği burada yapılacak
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
          Sign Up
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
