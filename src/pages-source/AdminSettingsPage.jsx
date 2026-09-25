'use client';

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { getSettings, adminUpdateSettings } from "../services/api";
import { useAdminTheme } from "../context/AdminThemeContext";

const AdminSettingsPage = () => {
  const { isDark } = useAdminTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [defaultShippingCost, setDefaultShippingCost] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSettings();
      setSettings(data);
      setDefaultShippingCost(data.defaultShippingCost ?? 150);
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        defaultShippingCost: Number(defaultShippingCost)
      };
      await adminUpdateSettings(payload);
      setSuccess("Settings updated successfully!");
      await load();
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAdminAuth>
      <AdminLayout>
        <div className="flex flex-col gap-8">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              Global Settings
            </h1>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Manage global configuration for your store.
            </p>
          </div>

          {loading ? (
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Loading settings...
            </div>
          ) : (
            <div className={`border rounded-2xl p-6 md:p-8 max-w-xl shadow-sm transition-colors ${
              isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
              {success && <p className="text-sm text-emerald-500 mb-4 font-semibold">{success}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block mb-2 font-semibold text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Default Shipping Cost (Rs)
                  </label>
                  <input
                    type="number"
                    value={defaultShippingCost}
                    onChange={(e) => setDefaultShippingCost(e.target.value)}
                    required
                    min="0"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition-colors ${
                      isDark
                        ? "bg-[#0B0F19] border-[#1E293B] text-white"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                  <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    This shipping cost is applied if a product or promotion does not have a specific shipping cost override. 
                    If multiple items are in the cart, the highest applicable shipping cost is charged exactly once.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white rounded-xl font-bold shadow-md shadow-[#00AEEF]/20 hover:opacity-95 transition-all disabled:opacity-70 cursor-pointer text-sm"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminSettingsPage;
