<footer className="bg-[#f5f7ff] text-gray-700 py-10 mt-20">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
    
    {/* Site Hakkında */}
    <div>
      <h3 className="text-2xl font-bold mb-4 text-purple-600">Flavors of Turkey</h3>
      <p className="text-gray-600 text-sm">
        Explore authentic Turkish recipes based on the ingredients you have! Bringing the rich culinary heritage of Turkey to your kitchen.
      </p>
    </div>

    {/* Quick Links */}
    <div className="text-center">
      <h4 className="text-xl font-semibold mb-4 text-purple-600">Quick Links</h4>
      <ul className="space-y-2 text-sm">
        <li>
          <a href="/signup" className="hover:text-purple-600 transition">
            Sign Up
          </a>
        </li>
        <li>
          <a href="/signin" className="hover:text-purple-600 transition">
            Sign In
          </a>
        </li>
        <li>
          <a href="#how-it-works" className="hover:text-purple-600 transition">
            How It Works
          </a>
        </li>
      </ul>
    </div>

    {/* Sosyal Medya */}
    <div className="text-center">
      <h4 className="text-xl font-semibold mb-4 text-purple-600">Follow Us</h4>
      <div className="flex justify-center space-x-4">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-purple-600 transition text-2xl"
        >
          <i className="fab fa-instagram"></i>
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-purple-600 transition text-2xl"
        >
          <i className="fab fa-facebook"></i>
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-purple-600 transition text-2xl"
        >
          <i className="fab fa-twitter"></i>
        </a>
      </div>
    </div>

  </div>

  {/* Alt Bilgi */}
  <div className="text-center text-xs text-gray-500 mt-10">
    © {new Date().getFullYear()} Flavors of Turkey. All rights reserved.
  </div>
</footer>

{/* Back to Top Butonu */}
<a
  href="#top"
  className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition z-50"
  aria-label="Back to Top"
>
  ↑
</a>
