import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function PasswordResetConfirm() {
  //uidb64--user id (base64 ile şifrelenmiş)
  const { uidb64, token } = useParams();
  const navigate = useNavigate();//başka bir sayfaya yönlendirme

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
//e--kullancı formu göndernce oluşan olay
  const handleSubmit = async (e) => {//handle-- form gönderilmesini sağlar
    e.preventDefault();

    if (newPassword !== confirmPassword) {//2 şifre aynı değilse
      setError("Passwords do not match.");
      return;
    }

    try {// kullacının id ve token(şifre sıfırlama için anah)--backend gönderdiğimiz adres
      await axios.post(`/api/users/password-reset-confirm/${uidb64}/${token}/`, {
        password: newPassword,
      });
      setSuccess(true);//şifre değiştirildi mesajı
      setTimeout(() => navigate("/signin"), 2000); // 2 saniye sonra login sayfasına yönlendir
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#c1c7f7] to-white">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">Reset Your Password</h2>

        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {success && <div className="text-green-500 mb-4 text-center">Password reset successful!</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">New Password</label>
            <input //yeni şifre
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-semibold">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              //onChange-- input kutusunda bir değişiklik olunca çalışır.
              onChange={(e) => setConfirmPassword(e.target.value)}// input yazılan değer
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetConfirm;
