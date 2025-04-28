import { useState } from "react";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Backend'e istek: buraya gerçek API eklenecek
    console.log("Şifre sıfırlama isteği gönderildi:", email);

    setSubmitted(true);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>

        {!submitted ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
              Send Reset Link
            </button>
          </>
        ) : (
          <p className="text-center text-green-600 font-medium">
            If this email exists, a reset link has been sent.
          </p>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;
