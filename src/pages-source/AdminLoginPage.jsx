'use client';

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from '@/components/RouterCompat';
import { adminLogin } from "../services/api";
import { colors } from "../theme";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await adminLogin(email.trim(), password);
      localStorage.setItem("adminToken", data.token);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 md:py-16 flex items-center justify-center bg-gradient-to-br from-white via-[#F9F9F9] to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E0E0E0] p-7 md:p-8">
        <h1 className="text-2xl font-bold mb-2.5" style={{ color: colors.text.primary }}>
          Admin Login
        </h1>
        <p className="text-sm mb-7" style={{ color: colors.text.secondary }}>
          Sign in to manage products, promotions, and orders.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kitepk.com"
              className="w-full px-3.5 py-2.5 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-11 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#00AEEF] to-[#0095CC] hover:shadow-lg hover:shadow-[#00AEEF]/30 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
