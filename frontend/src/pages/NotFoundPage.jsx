import { Link } from "react-router-dom";
import { FaHome, FaBoxOpen } from "react-icons/fa";
import SeoHead from "../components/seo/SeoHead";

const NotFoundPage = () => {
  return (
    <>
      <SeoHead title="Page Not Found" path="/404" noindex />
      <div className="min-h-screen bg-linear-to-b from-[#f7fdff] via-white to-[#edf8ff] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl text-center bg-white rounded-3xl shadow-xl border border-[#d8eef9] p-8 md:p-12 fade-in">
          <p className="text-[#00AEEF] font-bold tracking-[0.25em] text-sm md:text-base">
            ERROR 404
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#222222] mt-4 mb-4">
            Page Not Found
          </h1>
          <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto mb-8">
            The page you are looking for may have been moved, removed, or the link
            might be incorrect.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-[#00AEEF] text-white font-semibold hover:bg-[#0095CC]"
            >
              <FaHome />
              Back to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full border-2 border-[#00AEEF] text-[#00AEEF] font-semibold hover:bg-[#00AEEF] hover:text-white"
            >
              <FaBoxOpen />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
