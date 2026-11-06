"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const foodItems = [
    {
      title: "Butter Chicken",
      img: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
    },
    {
      title: "Biryani",
      img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    },
    {
      title: "Pasta",
      img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    },
    {
      title: "Dessert",
      img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
    },
  ];

  const delays = ["delay-100", "delay-200", "delay-300", "delay-400"];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <h1
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-orange-600 cursor-pointer tracking-tight hover:scale-105 transition-transform duration-200"
          >
            🍽️ Savorly
          </h1>
          <div className="flex gap-2 items-center">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => router.push("/my-profile")}
                  className="text-stone-600 px-3 py-1.5 rounded-full text-sm hover:bg-stone-100 transition-all duration-200 hover:scale-105"
                >
                  My Profile
                </button>
                <button
                  onClick={() => router.push("/feed")}
                  className="text-stone-600 px-3 py-1.5 rounded-full text-sm hover:bg-stone-100 transition-all duration-200 hover:scale-105"
                >
                  Feed
                </button>
                <button
                  onClick={() => router.push("/create")}
                  className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                >
                  + Create
                </button>
                <button
                  onClick={handleLogout}
                  className="text-stone-500 px-3 py-1.5 rounded-full text-sm hover:bg-stone-100 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="text-stone-600 px-4 py-1.5 rounded-full text-sm hover:bg-stone-100 transition-all duration-200 hover:scale-105"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 text-white animate-fade-in">
        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight drop-shadow-sm animate-on-load animate-fade-in-up">
            Share Your
            <br />
            Food Stories
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-10 max-w-xl mx-auto leading-relaxed animate-on-load animate-fade-in-up delay-100">
            A community for food lovers. Post your favorite dishes, discover new
            recipes, and inspire others.
          </p>
          <div className="animate-on-load animate-fade-in-up delay-200">
            {isLoggedIn ? (
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => router.push("/create")}
                  className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Create Post
                </button>
                <button
                  onClick={() => router.push("/feed")}
                  className="border-2 border-white/80 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  View Feed
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/register")}
                className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                Join Now — It's Free
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sample Foods */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-stone-800 mb-2 text-center animate-on-load animate-fade-in-up">
          What people are sharing
        </h3>
        <p className="text-stone-500 text-center mb-10 animate-on-load animate-fade-in-up delay-100">
          From homemade curries to street food finds
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {foodItems.map((item, i) => (
            <div
              key={i}
              className={`group rounded-2xl overflow-hidden shadow-md border border-stone-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-on-load animate-fade-in-up ${delays[i]}`}
            >
              <div className="overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="p-3 text-sm font-semibold text-stone-700 text-center">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* About — Cursive style */}
      <div className="bg-white border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-on-load animate-fade-in-up">
          <h3 className="text-2xl font-bold text-stone-800 mb-6">
            About Savorly
          </h3>
          <p
            className="text-stone-600 max-w-2xl mx-auto leading-relaxed text-2xl"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', cursive",
              fontStyle: "italic",
            }}
          >
            Savorly is a home for food lovers. Upload photos of your favorite
            dishes, write the stories behind them, and share with a community
            that understands — every plate has a memory, and every memory
            deserves to be shared.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        © 2026 Savorly — Made with ❤️ for foodies
      </footer>
    </div>
  );
}
