import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { getSettings, adminUpdateSettings } from "../services/api";
import { colors } from "../theme";

const AdminSettingsPage = () => {
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
            <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
              Global Settings
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
              Manage global configuration for your store.
            </p>
          </div>

          {loading ? (
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Loading settings...
            </div>
          ) : (
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 md:p-6 max-w-xl">
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              {success && <p className="text-sm text-green-600 mb-4">{success}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-1.5 font-medium">Default Shipping Cost (Rs)</label>
                  <input
                    type="number"
                    value={defaultShippingCost}
                    onChange={(e) => setDefaultShippingCost(e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                  />
                  <p className="text-xs text-[#666666] mt-1.5">
                    This shipping cost is applied if a product or promotion does not have a specific shipping cost override. 
                    If multiple items are in the cart, the highest applicable shipping cost is charged exactly once.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#00AEEF] text-white rounded-lg font-bold hover:bg-[#0095CC] transition-colors disabled:opacity-70"
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
