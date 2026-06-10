import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import kiteLogo1 from "../assets/kite_part1.png";
import kiteLogo2 from "../assets/kite_part2.png";
import { getProducts } from "../services/api";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});
  const [navProducts, setNavProducts] = useState([]);
  const location = useLocation();

  const toggleMobileCategory = (categoryTitle) => {
    setExpandedMobileCategories((prev) => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle],
    }));
  };

  useEffect(() => {
    let isMounted = true;
    let idleId;
    let timeoutId;

    const load = async () => {
      try {
        const data = await getProducts();
        if (!isMounted) return;
        setNavProducts(data.filter((p) => p.showInNavbar !== false));
      } catch {
        if (isMounted) setNavProducts([]);
      }
    };

    const scheduleLoad = () => {
      void load();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(scheduleLoad, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(scheduleLoad, 1200);
    }

    return () => {
      isMounted = false;
      if (idleId && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const dynamicMegaMenu = useMemo(() => {
    const groups = new Map();
    const preferredOrder = ["Safety Matches", "Detergents", "Dish Wash"];
    navProducts
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .forEach((p) => {
        const title = p.navGroup || p.category || "Products";
        if (!groups.has(title)) groups.set(title, []);
        groups.get(title).push({ name: p.title, href: `/products/${p.id}` });
      });
    return Array.from(groups.entries())
      .map(([title, items]) => ({ title, items }))
      .sort((a, b) => {
        const ai = preferredOrder.indexOf(a.title);
        const bi = preferredOrder.indexOf(b.title);
        const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
        const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
        if (aRank !== bRank) return aRank - bRank;
        return a.title.localeCompare(b.title);
      });
  }, [navProducts]);

  const navItems = [
    { name: "Home", href: "/" },
    {
      name: "Products",
      href: "/products",
      megaMenu: dynamicMegaMenu,
    },
    {
      name: "Promotions & Packages",
      href: "/promotions-packages",
    },
    // {
    //   name: 'Divisions',
    //   href: '/fmcg-division',
    //   dropdown: [
    //     { name: 'FMCG Division (Kite)', href: '/fmcg-division' },
    //     { name: 'Textile Division', href: '/textile-division' },
    //     { name: 'Board Division', href: '/board-division' },
    //     { name: 'Real Estate', href: '/real-estate' },
    //   ],
    // },
    {
      name: "Export",
      href: "/export/safety-matches",
      dropdown: [
        { name: "Safety Matches", href: "/export/safety-matches" },
        { name: "Wooden Splints", href: "/export/wooden-splints" },
      ],
    },
    { name: "About", href: "/about" },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center active:border-0">
              <img
                src={kiteLogo1}
                alt="Kite Brand logo icon"
                decoding="async"
                width="80"
                height="80"
                className="w-20! p-2 h-auto"
              />
              <img
                src={kiteLogo2}
                alt="Kite Brand wordmark"
                decoding="async"
                width="80"
                height="80"
                className="w-20! h-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-end space-x-6 flex-1">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() =>
                  (item.dropdown?.length || item.megaMenu?.length) && setOpenDropdown(item.name)
                }
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={item.href}
                  className={`text-base font-medium transition-colors duration-300 flex items-center gap-1 py-1 focus:outline-none ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-text-primary hover:text-primary"
                  }`}
                >
                  {item.name}
                  {(item.dropdown?.length || item.megaMenu?.length) && (
                    <FaChevronDown className="text-xs" />
                  )}
                </Link>

                {/* Mega Menu */}
                {item.megaMenu?.length > 0 && openDropdown === item.name && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-[min(92vw,900px)] bg-white rounded-lg shadow-xl border border-gray-200 overflow-visible z-50"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div
                      className="grid gap-8 p-8"
                      style={{ gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, item.megaMenu.length))}, minmax(0, 1fr))` }}
                    >
                      {item.megaMenu.map((category) => (
                        <div key={category.title}>
                          <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                            {category.title}
                          </h3>

                          {/* Category Items */}
                          <ul className="space-y-2">
                            {category.items.map((menuItem) => (
                              <li key={menuItem.name}>
                                <Link
                                  to={menuItem.href}
                                  className={`block text-sm px-3 py-1 rounded transition-all duration-200 focus:outline-none ${
                                    isActive(menuItem.href)
                                      ? "text-primary bg-accent-tint font-semibold"
                                      : "text-text-secondary hover:text-primary hover:bg-accent-tint"
                                  }`}
                                >
                                  {menuItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Dropdown Menu */}
                {item.dropdown?.length > 0 && openDropdown === item.name && (
                  <div className="absolute left-0 -mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        to={dropdownItem.href}
                        className={`block px-4 py-2 transition-all duration-200 focus:outline-none ${
                          isActive(dropdownItem.href)
                            ? "text-primary bg-accent-tint font-semibold"
                            : "text-text-primary hover:bg-accent-tint hover:text-primary"
                        }`}
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Button */}
          <div className="hidden md:block flex-shrink-0">
            <Link
              to="/contact"
              className={`px-6 py-1.5 rounded-full font-medium transition-all duration-300 shadow-md focus:outline-none ${
                isActive("/contact")
                  ? "bg-primary-600 text-text-white shadow-lg scale-95"
                  : "bg-primary text-text-white hover:bg-primary-600 hover:shadow-lg active:scale-95"
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-primary hover:text-primary transition-colors focus:outline-none"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden bg-white border-t border-border-light"
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={`block px-3 py-1 rounded-lg font-medium transition-all duration-200 focus:outline-none ${
                    isActive(item.href)
                      ? "text-primary bg-gray-100"
                      : "text-text-primary hover:text-primary hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    !(item.dropdown?.length || item.megaMenu?.length) &&
                    setIsMobileMenuOpen(false)
                  }
                >
                  {item.name}
                </Link>
                {item.megaMenu?.length > 0 && (
                  <div className="pl-4 space-y-2 mt-2">
                    {item.megaMenu.map((category) => (
                      <div key={category.title}>
                        {/* Category Header - Clickable to expand/collapse */}
                        <button
                          onClick={() => toggleMobileCategory(category.title)}
                          className="w-full flex items-center justify-between text-xs font-bold text-primary py-1.5 uppercase focus:outline-none"
                        >
                          <span>{category.title}</span>
                          <FaChevronDown
                            className={`text-xs transition-transform duration-200 ${
                              expandedMobileCategories[category.title]
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {/* Expanded Category Content */}
                        {expandedMobileCategories[category.title] && (
                          <div className="space-y-1 mt-1">
                            {/* Category Items */}
                            {category.items.map((menuItem) => (
                              <Link
                                key={menuItem.name}
                                to={menuItem.href}
                                className="block px-3 py-1 text-sm text-[#666666] hover:text-[#00AEEF] hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {menuItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {item.dropdown?.length > 0 && (
                  <div className="pl-4 space-y-1">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        to={dropdownItem.href}
                        className="block px-3 py-1 text-sm text-text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/contact"
              className={`block w-full text-center px-6 py-1.5 rounded-full font-medium transition-all duration-300 mt-4 focus:outline-none ${
                isActive("/contact")
                  ? "bg-primary-600 text-text-white shadow-lg"
                  : "bg-primary text-text-white hover:bg-primary-600 active:scale-95"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
