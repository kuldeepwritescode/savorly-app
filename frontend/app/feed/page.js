"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    fetchPosts();
    if (token) fetchCurrentUser();
  }, []);

  const fetchPosts = async (searchTerm = "") => {
    try {
      let url = "http://127.0.0.1:8000/posts/";
      if (searchTerm) url += `?search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
      data.forEach((post) => fetchLikeCount(post.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchPosts(search);
  };

  const fetchLikeCount = async (postId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/posts/${postId}/likes`);
      if (res.ok) {
        const data = await res.json();
        setLikeCounts((prev) => ({ ...prev, [postId]: data.likes_count }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => ({ ...prev, [postId]: data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId) => {
    const isOpen = showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen) fetchComments(postId);
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      alert("Please login to like posts");
      return;
    }
    const token = localStorage.getItem("token");
    const isLiked = likedPosts[postId];

    try {
      if (isLiked) {
        const res = await fetch(`http://127.0.0.1:8000/posts/${postId}/like`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to unlike");
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: Math.max((prev[postId] || 1) - 1, 0),
        }));
      } else {
        const res = await fetch(`http://127.0.0.1:8000/posts/${postId}/like`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json();
          if (err.detail === "Already liked") {
            setLikedPosts((prev) => ({ ...prev, [postId]: true }));
            return;
          }
          throw new Error(err.detail || "Failed to like");
        }
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1,
        }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (postId) => {
    if (!isLoggedIn) {
      alert("Please login to comment");
      return;
    }
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:8000/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: text }),
        },
      );
      if (!res.ok) throw new Error("Failed to add comment");
      const newComment = await res.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:8000/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to delete comment");
      fetchComments(postId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    router.push("/login");
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-stone-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <h1
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-orange-600 cursor-pointer tracking-tight hover:scale-105 transition-transform duration-200"
          >
            🍽️Savorly
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 animate-fade-in-up">
          Latest Posts
        </h2>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-6 flex gap-2 animate-on-load animate-fade-in-up delay-100"
        >
          <input
            type="text"
            placeholder="Search posts by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-stone-300 rounded-full px-5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all duration-200"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLoading(true);
                fetchPosts("");
              }}
              className="bg-stone-100 text-stone-600 px-4 py-2.5 rounded-full text-sm hover:bg-stone-200 transition-all duration-200"
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 border border-red-200 animate-scale-in">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-stone-100 animate-scale-in">
            <p className="text-stone-500 text-lg mb-2">
              {search ? "No posts found for your search." : "No posts yet."}
            </p>
            {!search && isLoggedIn && (
              <button
                onClick={() => router.push("/create")}
                className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              >
                Create Post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 animate-on-load animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 0.08, 0.4)}s` }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-stone-800">
                    {post.title}
                  </h3>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium capitalize">
                    {post.category}
                  </span>
                </div>

                <p className="text-sm text-stone-500 mb-3">
                  by{" "}
                  <span
                    onClick={() =>
                      router.push(`/profile/${post.owner_username}`)
                    }
                    className="font-semibold text-orange-600 cursor-pointer hover:underline"
                  >
                    @{post.owner_username || "unknown"}
                  </span>
                </p>

                {post.description && (
                  <p className="text-stone-600 mb-3 leading-relaxed">
                    {post.description}
                  </p>
                )}

                {post.image_url && (
                  <div className="overflow-hidden rounded-xl mb-3 bg-stone-100">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full max-h-80 object-contain hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-stone-400">
                      {new Date(post.created_at).toLocaleString()}
                    </p>

                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                        likedPosts[post.id]
                          ? "bg-red-50 text-red-500"
                          : "bg-stone-50 text-stone-600 hover:bg-red-50 hover:text-red-500"
                      }`}
                    >
                      {likedPosts[post.id] ? "❤️" : "🤍"}{" "}
                      {likeCounts[post.id] || 0}
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-stone-50 text-stone-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      💬 Comments
                    </button>
                  </div>

                  {currentUser && currentUser.id === post.owner_id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/edit/${post.id}`)}
                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all duration-200 hover:scale-105"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments */}
                {showComments[post.id] && (
                  <div className="mt-4 border-t border-stone-100 pt-4 animate-fade-in">
                    <div className="space-y-3 mb-4">
                      {(comments[post.id] || []).length === 0 ? (
                        <p className="text-sm text-stone-400">
                          No comments yet.
                        </p>
                      ) : (
                        (comments[post.id] || []).map((c) => (
                          <div
                            key={c.id}
                            className="flex justify-between items-start bg-stone-50 rounded-xl px-3 py-2.5 animate-scale-in"
                          >
                            <div>
                              <span
                                onClick={() =>
                                  router.push(`/profile/${c.username}`)
                                }
                                className="text-sm font-semibold text-orange-600 cursor-pointer hover:underline"
                              >
                                @{c.username}
                              </span>
                              <p className="text-sm text-stone-700 mt-0.5">
                                {c.content}
                              </p>
                              <p className="text-xs text-stone-400 mt-1">
                                {new Date(c.created_at).toLocaleString()}
                              </p>
                            </div>
                            {currentUser &&
                              (currentUser.id === c.user_id ||
                                currentUser.id === post.owner_id) && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(post.id, c.id)
                                  }
                                  className="text-xs text-red-500 hover:text-red-700 ml-2 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                          </div>
                        ))
                      )}
                    </div>

                    {isLoggedIn ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText[post.id] || ""}
                          onChange={(e) =>
                            setCommentText((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddComment(post.id)
                          }
                          className="flex-1 border border-stone-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Post
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-stone-400">
                        <span
                          onClick={() => router.push("/login")}
                          className="text-orange-600 cursor-pointer hover:underline"
                        >
                          Login
                        </span>{" "}
                        to comment
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
