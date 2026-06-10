import { FaPlay, FaTimes, FaExpand } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import match_making from "../assets/videos/match_making.mp4";

const MatchMakingSection = () => {
  const videoRef = useRef(null);
  const expandedVideoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVideoClick = () => {
    setIsExpanded(true);
    // Small video stays muted, only expanded video has audio
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
    // Small video remains muted
  };

  return (
    <>
      <section className="relative min-h-[70svh] md:min-h-[600px] overflow-hidden border-t-8 border-b-8 border-[#00AEEF]">
        <div className="relative h-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 h-full items-center py-10 md:py-5">
            {/* Left Content */}
            <div className="text-black z-10">
              <div className="inline-block bg-[#00AEEF] backdrop-blur-xs px-4 py-2 rounded-full mb-6">
                <span className="text-white font-semibold text-sm uppercase tracking-wide">
                  Manufacturing Excellence
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                How Kite Matches Are Made
              </h2>

              <p className="text-black/90 text-lg md:text-xl mb-6 leading-relaxed">
                Discover the precision, technology, and craftsmanship behind
                Pakistan's most trusted safety matches. Over 50 years of
                manufacturing excellence.
              </p>

              <div className="grid grid-cols-1 justify-items-start sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-[10px] rounded-lg p-4">
                  <h3 className="text-2xl md:text-3xl font-bold mb-1">50+</h3>
                  <p className="text-black/90 text-sm md:text-base">
                    Years of Excellence
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-[10px] rounded-lg p-4 flex flex-col justify-center items-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-1">
                    10,000+
                  </h3>
                  <p className="text-black/90 text-sm md:text-base">
                    Daily Production
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-[10px] rounded-lg p-4">
                  <h3 className="text-2xl md:text-3xl font-bold mb-1">100%</h3>
                  <p className="text-black/90 text-sm md:text-base">
                    Quality Assured
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-[#00AEEF] text-white px-8 py-2 rounded-full font-semibold hover:text-black hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2"
                >
                  Explore Our Products
                </Link>
                {/* <Link
                  to="/fmcg-division"
                  className="bg-transparent border-2 border-[#00AEEF] text-black px-8 py-2 rounded-full font-semibold hover:bg-white hover:text-[#00AEEF] transition-all duration-300 active:scale-95 inline-flex items-center gap-2"
                >
                  <FaPlay className="text-sm" />
                  Learn More
                </Link> */}
              </div>
            </div>

            {/* Right Video */}
            <div className="relative h-full flex items-center justify-center py-8">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group">
                <video
                  ref={videoRef}
                  className="w-full aspect-video object-cover rounded-2xl cursor-pointer"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onClick={handleVideoClick}
                >
                  <source src={match_making} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Expand Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 pointer-events-none">
                  <div className="bg-white/90 p-4 rounded-full">
                    <FaExpand className="text-2xl text-[#00AEEF]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Video Overlay */}
        {isExpanded && (
          <div
            className="fixed inset-0 top-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8 md:px-12 md:py-16"
            onClick={handleClose}
          >
            <div
              className="relative w-full max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-6 right-0 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 cursor-pointer"
                aria-label="Close video"
              >
                <FaTimes className="text-xl" />
              </button>

              {/* Expanded Video */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
                <video
                  ref={expandedVideoRef}
                  className="w-full h-[70svh] md:h-[90vh] object-contain rounded-2xl "
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  controls
                >
                  <source src={match_making} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}

        {/* Manufacturing Process Steps */}
        {/* <div className="absolute -bottom-4 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-black">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">1</div>
              <div className="text-sm">Wood Selection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">2</div>
              <div className="text-sm">Stick Cutting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">3</div>
              <div className="text-sm">Chemical Treatment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">4</div>
              <div className="text-sm">Box Packaging</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">5</div>
              <div className="text-sm">Quality Control</div>
            </div>
          </div>
        </div>
      </div> */}
      </section>
    </>
  );
};

export default MatchMakingSection;
