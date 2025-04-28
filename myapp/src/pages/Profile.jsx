import { useEffect, useState } from "react";
import API from "../api/api"; // Axios ayarladığımız api.js dosyasından geliyor

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/users/profile/");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {/* Top Section */}
        <div className="flex items-center mb-8">
          <img
            src={profile.image_url || "/assets/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mr-8 border-4 border-purple-300"
          />
          <div>
            <span className="bg-yellow-400 text-white font-bold px-3 py-1 rounded-full text-sm">HELLO</span>
            <h1 className="text-3xl font-bold mt-2">I'm {profile.name}</h1>
            <p className="text-gray-600">Web Developer</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Age:</strong> {profile.age}</p>
            <p><strong>Address:</strong> {profile.address}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
          <div>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Freelance:</strong> {profile.freelance}</p>
          </div>
        </div>

        {/* About Me Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-2">About Me</h2>
          <p className="text-gray-600">{profile.about}</p>
        </div>

        {/* Download Resume Button */}
        <div className="mt-6">
          <a
            href="#"
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
          >
            Download Resume
          </a>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center space-x-6 bg-purple-700 p-4 mt-10 rounded-lg">
        <a href="#" className="text-white text-2xl"><i className="fab fa-twitter"></i></a>
        <a href="#" className="text-white text-2xl"><i className="fab fa-facebook"></i></a>
        <a href="#" className="text-white text-2xl"><i className="fab fa-instagram"></i></a>
        <a href="#" className="text-white text-2xl"><i className="fab fa-linkedin"></i></a>
      </div>
    </div>
  );
}

export default Profile;