"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${username}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg mb-4">{error || "User not found"}</p>
        <button
          onClick={() => router.push("/feed")}
          className="text-orange-600 hover:underline"
        >
          ← Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1
            onClick={() => router.push("/")}
            className="text-xl font-bold text-orange-600 cursor-pointer"
          >
            Savorly
          </h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => router.push("/feed")}
              className="text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100"
            >
              Feed
            </button>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => router.push("/create")}
                  className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-orange-600"
                >
                  + Create Post
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-orange-600"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            {/* Profile Photo */}
            <div className="w-20 h-20 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-orange-600 border-2 border-orange-200">
              {profile.user.profile_image ? (
                <img
                  src={profile.user.profile_image}
                  alt={profile.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.user.username.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                @{profile.user.username}
              </h2>
              {profile.user.full_name && (
                <p className="text-gray-600">{profile.user.full_name}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                Joined {new Date(profile.user.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-orange-600 font-medium mt-1">
                {profile.total_posts}{" "}
                {profile.total_posts === 1 ? "post" : "posts"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-5">
          Posts by @{profile.user.username}
        </h3>

        {profile.posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {profile.posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {post.title}
                  </h4>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full capitalize">
                    {post.category}
                  </span>
                </div>

                {post.description && (
                  <p className="text-gray-600 mb-3">{post.description}</p>
                )}

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full max-h-80 object-contain rounded-lg mb-3 bg-gray-100"
                  />
                )}

                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
