"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    age: "",
    address: "",
    city: "",
    country: "",
    gender: "",
    phone: "",
    profile_image: "",
    created_at: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/users/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setFormData({
        username: data.username || "",
        email: data.email || "",
        full_name: data.full_name || "",
        age: data.age || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        gender: data.gender || "",
        phone: data.phone || "",
        profile_image: data.profile_image || "",
        created_at: data.created_at || "",
      });
      if (data.profile_image) setPreview(data.profile_image);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (profileFile) {
        const uploadData = new FormData();
        uploadData.append("file", profileFile);
        const uploadRes = await fetch(
          "http://127.0.0.1:8000/users/upload-profile-image",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: uploadData,
          },
        );
        if (!uploadRes.ok) throw new Error("Failed to upload profile image");
      }

      const res = await fetch("http://127.0.0.1:8000/users/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name || null,
          age: formData.age ? parseInt(formData.age) : null,
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || null,
          gender: formData.gender || null,
          phone: formData.phone || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setProfileFile(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading profile...</p>
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
            <button
              onClick={() => router.push("/create")}
              className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-orange-600"
            >
              + Create Post
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-sm hover:bg-blue-100"
              >
                Edit
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm border border-green-200">
              {success}
            </div>
          )}

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-2 border-2 border-gray-200">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                  👤
                </div>
              )}
            </div>
            {isEditing && (
              <label className="text-sm text-orange-600 cursor-pointer hover:underline">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {isEditing ? (
            /* ========== EDIT MODE ========== */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:bg-orange-300"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* ========== VIEW MODE ========== */
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Username</span>
                <span className="font-medium text-gray-800">
                  @{formData.username}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Email</span>
                <span className="font-medium text-gray-800">
                  {formData.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Full Name</span>
                <span className="font-medium text-gray-800">
                  {formData.full_name || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Phone</span>
                <span className="font-medium text-gray-800">
                  {formData.phone || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Age</span>
                <span className="font-medium text-gray-800">
                  {formData.age || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Gender</span>
                <span className="font-medium text-gray-800 capitalize">
                  {formData.gender || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Address</span>
                <span className="font-medium text-gray-800">
                  {formData.address || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">City</span>
                <span className="font-medium text-gray-800">
                  {formData.city || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Country</span>
                <span className="font-medium text-gray-800">
                  {formData.country || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 text-sm">Joined</span>
                <span className="font-medium text-gray-800">
                  {formData.created_at
                    ? new Date(formData.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
