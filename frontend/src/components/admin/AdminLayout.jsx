import { Link, useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../theme";
import NotificationCenter from "./NotificationCenter";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/admin/products", label: "Products" },
    { to: "/admin/promotions", label: "Promotions" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/settings", label: "Settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white via-[#F9F9F9] to-white">
      <aside className="w-full md:w-68 border-b md:border-b-0 md:border-r border-[#E0E0E0] bg-white/80 backdrop-blur">
        <div className="px-7 py-6 border-b border-[#E0E0E0]">
          <h1 className="text-xl font-bold" style={{ color: colors.primary.main }}>
            Admin Panel
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
            Kite Products & Promotions
          </p>
        </div>
        <nav className="px-4 py-5 grid grid-cols-2 md:grid-cols-1 gap-2.5 text-sm">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3.5 py-2.5 rounded-lg ${
                  active ? "bg-[#EAF8FE] text-[#0095CC] font-semibold" : "hover:bg-[#F9F9F9] text-[#222222]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="md:mt-3 w-full text-left px-3.5 py-2.5 rounded-lg border border-[#E0E0E0] text-[#222222] hover:bg-[#F9F9F9]"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex justify-end p-4 md:px-8 border-b border-transparent md:border-[#E0E0E0] bg-white/50 backdrop-blur">
          <NotificationCenter />
        </div>
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
