import '@fortawesome/fontawesome-free/css/all.min.css';

function Home() {
  return (
    <div id="top" className="bg-gradient-to-b from-[#c1c7f7] to-white min-h-screen relative">
      
      {/* WELCOME Bölümü */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center text-white overflow-hidden">
        {/* Arka plan görseli */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/homepage.jpg')" }}
        ></div>

        {/* Siyah yarı saydam katman */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* İçerik */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to the Flavors of Turkey</h1>
          <p className="text-md md:text-xl mb-8 max-w-2xl mx-auto">
            Explore authentic Turkish recipes crafted with love and tradition. Discover new tastes based on the ingredients you have!
          </p>
          <a
            href="/signup"
            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
          >
            Start Your Journey
          </a>
        </div>
      </section>

      {/* HOW IT WORKS Bölümü */}
      <section id="how-it-works" className="pt-16 pb-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800">How It Works</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Discover delicious recipes tailored to the ingredients you have at home!
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 px-6">
          {[1,2,3,4,5,6].map((step, index) => {
            const titles = [
              "Sign Up",
              "Enter Ingredients",
              "Get Recipe Suggestions",
              "Smart Ingredient Matching",
              "Add to Shopping List",
              "Save & Share"
            ];
            const descriptions = [
              "Create your free account to get started.",
              "List the ingredients you have at home.",
              "Instantly discover recipes based on your ingredients.",
              "If you're missing ingredients, we suggest the best alternatives!",
              "Easily add missing ingredients to your shopping list for convenience.",
              "Save your favorite recipes and share them with friends!"
            ];
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="bg-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold text-purple-600 mb-4">
                  {step}
                </div>
                <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition w-full text-center min-h-[280px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{titles[index]}</h3>
                    <p className="text-gray-600 text-sm">{descriptions[index]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER Bölümü */}
      <footer className="bg-[#f5f7ff] text-gray-700 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Site Hakkında */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Flavors of Turkey</h3>
            <p className="text-gray-600 text-sm">
              Explore authentic Turkish recipes based on the ingredients you have! Bringing the rich culinary heritage of Turkey to your kitchen.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-purple-600">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/signup" className="hover:text-purple-600 transition">Sign Up</a></li>
              <li><a href="/signin" className="hover:text-purple-600 transition">Sign In</a></li>
              <li><a href="#how-it-works" className="hover:text-purple-600 transition">How It Works</a></li>
            </ul>
          </div>

          {/* Sosyal Medya */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-purple-600">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition text-2xl">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition text-2xl">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition text-2xl">
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

      

    </div>
  );
}

export default Home;
