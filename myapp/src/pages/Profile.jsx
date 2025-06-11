import { useEffect, useState } from "react";
import API from "../api/api";

function AccountDetails() {
  const [profile, setProfile] = useState(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const avatarOptions = [
    "/media/avatars/avatar1.png",
    "/media/avatars/avatar2.png",
    "/media/avatars/avatar3.png",
    "/media/avatars/avatar4.png",
    "/media/avatars/avatar5.png",
    "/media/avatars/avatar6.png",
    "/media/avatars/avatar7.png"
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("users/profile/");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarSelect = async (url) => {
    try {
      await API.patch("users/profile/", { avatar: url });
      setProfile((prev) => ({ ...prev, avatar: url }));
      setShowAvatarOptions(false);
    } catch (error) {
      console.error("Avatar update failed:", error);
    }
  };

  if (!profile) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="py-10 text-center relative">
        <div
          className="inline-block px-6 py-2 rounded"
          style={{ background: "linear-gradient(90deg, #cdffd8, #94b9ff)", color: "black" }}
        >
          <h1 className="text-4xl font-bold">Account Details</h1>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto px-4 md:px-10 py-10">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white rounded-lg shadow-md py-6 px-4">
          <div className="flex flex-col items-center mb-6">
            <img
              src={profile.avatar ? `http://127.0.0.1:8000${profile.avatar}` : "/media/avatars/avatar0.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            <h2 className="text-lg font-semibold">{profile.username}</h2>
          </div>
          <nav className="space-y-4">
            <a href="/" className="flex items-center gap-2 text-sm hover:text-purple-200">
              <i className="fa-solid fa-house"></i> Homepage
            </a>
            <a href="/profile" className="flex items-center gap-2 text-sm hover:text-purple-200">
              <i className="fa-solid fa-user"></i> Account Details
            </a>
            <a href="/saved-recipes" className="flex items-center gap-2 text-sm hover:text-purple-200">
              <i className="fa-solid fa-bookmark"></i> Saved Recipes
            </a>
            <a href="/recipe-history" className="flex items-center gap-2 text-sm hover:text-purple-200">
              <i className="fa-solid fa-clock-rotate-left"></i> Recipe History
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white shadow-lg rounded-lg ml-6 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm cursor-not-allowed"
                />
              </div>
            </div>
            <button
              className="mt-6 px-6 py-2 rounded-full font-semibold shadow"
              style={{ background: "linear-gradient(90deg, #cdffd8, #94b9ff)", color: "black" }}
            >
              Change Password
            </button>
          </div>

          <hr className="my-10" />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Avatar</h2>
            <div className="flex items-center gap-6 relative">
              <img
                src={profile.avatar ? `http://127.0.0.1:8000${profile.avatar}` : "/media/avatars/avatar0.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="relative">
                <button
                  onClick={() => setShowAvatarOptions((prev) => !prev)}
                  className="px-6 py-2 rounded-full font-semibold shadow"
                  style={{ background: "linear-gradient(90deg, #cdffd8, #94b9ff)", color: "black" }}
                >
                  Select Avatar
                </button>
                {showAvatarOptions && (
                  <div className="absolute mt-2 bg-white border rounded shadow grid grid-cols-3 gap-2 p-2 z-10">
                    {avatarOptions.map((url, idx) => (
                      <img
                        key={idx}
                        src={`http://127.0.0.1:8000${url}`}
                        alt={`avatar-${idx}`}
                        className="w-16 h-16 object-cover cursor-pointer rounded hover:scale-105 transition"
                        onClick={() => handleAvatarSelect(url)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="my-10" />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Biography</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Country</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option>Turkey</option>
                  <option>Germany</option>
                  <option>USA</option>
                  <option>UK</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold shadow">
              Delete Account
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AccountDetails;
