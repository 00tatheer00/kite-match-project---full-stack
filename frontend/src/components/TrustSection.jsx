import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaHandshake,
  FaCertificate,
  FaGlobe,
  FaExpand,
  FaPlay,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const videoGallery = [
  {
    title: "Video 1",
    youtubeUrl: "https://youtu.be/mNyMM9uqsYg?feature=shared",
  },
  {
    title: "Video 2",
    youtubeUrl: "https://youtu.be/nJb4jDTwKYk?si=q7GBA0YwTZEXaRkR",
  },
  {
    title: "Video 3",
    youtubeUrl: "https://youtu.be/GWw0qA_7Kd4?si=OqrUswkLuUbUjFR-",
  },
  {
    title: "Video 4",
    youtubeUrl: "https://youtu.be/G02w16NXM90?si=apJ4UyQu8-PS3M_v",
  },
  {
    title: "Video 5",
    youtubeUrl: "https://youtu.be/e_NxhN6apAE?si=ScqZx4ekgAah0L_5",
  },
  {
    title: "Video 6",
    youtubeUrl: "https://youtu.be/HHzMR1gLHUA?si=NuIxS1We-Aba6SEW",
  },
  {
    title: "Video 7",
    youtubeUrl: "https://youtu.be/6sggWLb856o?si=ExJVBhChanrBUrwY",
  },
  {
    title: "Video 8",
    youtubeUrl: "https://youtu.be/yCn-tw_SdDs?si=x-JhzOF-Thu1IYeD",
  },
  {
    title: "Video 9",
    youtubeUrl: "https://youtu.be/piALdUm40Gc?si=sVxVB50_AQ8mrCRq",
  },
  {
    title: "Video 10",
    youtubeUrl: "https://youtu.be/8hOODu43PuI?si=ykf8cyL7ahO2axrz",
  },
  {
    title: "Video 11",
    youtubeUrl: "https://youtu.be/kXqWiE1zquc?si=kqZStBq0Km9Kb9B2",
  },
];

let youtubeApiPromise;

const loadYouTubeIframeApi = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    const handleReady = () => resolve(window.YT);

    if (existingScript) {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === "function") {
          previousReady();
        }
        handleReady();
      };
      return;
    }

    window.onYouTubeIframeAPIReady = handleReady;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  });

  return youtubeApiPromise;
};

const extractYouTubeId = (value) => {
  if (!value) return "";

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").split("/")[0];
    }

    const watchId = url.searchParams.get("v");
    if (watchId) return watchId;

    const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch?.[1]) return embedMatch[1];
  } catch {
    return value;
  }

  return value;
};

const getThumbnailUrl = (youtubeId) =>
  youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

const TrustSection = () => {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: false,
    threshold: 0.25,
  });
  const carouselRef = useRef(null);
  const inlinePlayerContainerRefs = useRef({});
  const fullscreenPlayerContainerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollState, setScrollState] = useState({
    showLeft: false,
    showRight: true,
  });

  const trustPoints = [
    {
      icon: <FaCheckCircle className="text-5xl text-[#00AEEF]" />,
      title: "Over 50 Years of Excellence",
      description:
        "Manufacturing excellence since the 1970s with a proven track record of quality and reliability.",
    },
    {
      icon: <FaHandshake className="text-5xl text-[#ED028C]" />,
      title: "Trusted Partnerships",
      description:
        "Long-standing relationships with international brands and financial institutions across the globe.",
    },
    {
      icon: <FaCertificate className="text-5xl text-[#00AEEF]" />,
      title: "Internationally Certified",
      description: "Multiple certification including ISO 9001, UKAS, IAF",
    },
    {
      icon: <FaGlobe className="text-5xl text-[#ED028C]" />,
      title: "Global Reach",
      description:
        "Exporting to over 40 countries across Europe, Asia, and Africa.",
    },
  ];

  const getActiveVideoId = (index) =>
    extractYouTubeId(videoGallery[index]?.youtubeUrl);

  const scrollCarouselByTwo = (direction) => {
    const nextIndex = Math.max(
      0,
      Math.min(videoGallery.length - 1, activeIndexRef.current + direction * 2),
    );

    const targetCard = carouselRef.current?.querySelector(
      `[data-video-card-index="${nextIndex}"]`,
    );

    targetCard?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollState({
      showLeft: scrollLeft > 12,
      showRight: scrollLeft + clientWidth < scrollWidth - 12,
    });
  };

  const handleOpenFullscreen = () => setIsExpanded(true);

  const handleCloseFullscreen = (event) => {
    event.stopPropagation();
    setIsExpanded(false);
  };

  const handleSelectVideo = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const activeVideoId = getActiveVideoId(activeIndex);

    if (!activeVideoId) {
      playerInstanceRef.current?.destroy?.();
      playerInstanceRef.current = null;
      return undefined;
    }

    if (!sectionInView && !isExpanded) {
      return undefined;
    }

    let cancelled = false;

    const mountPlayer = async () => {
      const YT = await loadYouTubeIframeApi();
      if (cancelled || !YT) return;

      const mountTarget = isExpanded
        ? fullscreenPlayerContainerRef.current
        : inlinePlayerContainerRefs.current[activeIndex];

      if (!mountTarget) return;

      playerInstanceRef.current?.destroy?.();

      playerInstanceRef.current = new YT.Player(mountTarget, {
        videoId: activeVideoId,
        playerVars: {
          autoplay: 1,
          controls: isExpanded ? 1 : 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          fs: 1,
        },
        events: {
          onReady: (event) => {
            if (isExpanded) {
              event.target.unMute();
              event.target.setVolume(100);
            } else {
              event.target.mute();
            }

            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              setActiveIndex((current) => (current + 1) % videoGallery.length);
              return;
            }

            if (!cancelled && event.data === YT.PlayerState.PLAYING) {
              setDisplayedIndex(activeIndexRef.current);
            }
          },
        },
      });
    };

    mountPlayer();

    return () => {
      cancelled = true;
      playerInstanceRef.current?.destroy?.();
      playerInstanceRef.current = null;
    };
  }, [activeIndex, isExpanded, sectionInView]);

  useEffect(() => {
    return () => {
      playerInstanceRef.current?.destroy?.();
      playerInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    const activeCard = container?.querySelector(
      `[data-video-card-index="${activeIndex}"]`,
    );

    activeCard?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  useEffect(() => {
    const container = carouselRef.current;
    if (container) {
      handleCarouselScroll();
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            Why Choose Us
          </h2>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
            A Legacy of Trust & Excellence
          </h3>
          <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8" />
          <p className="text-text-secondary text-lg max-w-3xl mx-auto">
            Mohsin Match Factory and Kite brand - largely self-financed with an
            impeccable record. Our commitment to quality, innovation, and
            ethical business practices has made us a trusted partner for
            businesses and households worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="card-hover bg-linear-to-br from-white to-[#FFEFF9] p-8 rounded-2xl border-2 border-[#E0E0E0] text-center group"
            >
              <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {point.icon}
              </div>
              <h4 className="text-[#222222] text-xl font-bold mb-4">
                {point.title}
              </h4>
              <p className="text-text-secondary leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <div className="relative">
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pr-8 lg:pr-0 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {videoGallery.map((video, index) => {
                const youtubeId = extractYouTubeId(video.youtubeUrl);
                const isVisible = index === displayedIndex;

                return (
                  <article
                    key={video.title}
                    data-video-card
                    data-video-card-index={index}
                    className="group relative snap-start flex-none w-[62%] sm:w-[48%] lg:w-[34%] xl:w-[28%]"
                  >
                    <div className="relative aspect-1/2 overflow-hidden rounded-3xl border border-black/10 bg-[#111827] shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                      <div className="absolute inset-0 bg-black">
                        <div
                          ref={(node) => {
                            if (node) {
                              inlinePlayerContainerRefs.current[index] = node;
                            } else {
                              delete inlinePlayerContainerRefs.current[index];
                            }
                          }}
                          id={`trust-inline-player-${index}`}
                          className="h-full w-full"
                        />

                        {(!isVisible || displayedIndex !== index) && (
                          <>
                            <img
                              src={getThumbnailUrl(youtubeId)}
                              alt={video.title}
                              className="absolute inset-0 z-10 h-full w-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 z-20 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                            <button
                              type="button"
                              onClick={() => handleSelectVideo(index)}
                              className="absolute inset-0 z-30 flex items-center justify-center"
                              aria-label={`Play ${video.title}`}
                            >
                              <span className="inline-flex items-center justify-center rounded-full bg-white/90 p-5 text-[#00AEEF] shadow-2xl transition-all duration-300 hover:bg-white hover:scale-105">
                                <FaPlay className="text-2xl" />
                              </span>
                            </button>
                          </>
                        )}

                        {isVisible && displayedIndex === index && (
                          <div className="absolute inset-0 z-10 pointer-events-none bg-transparent" />
                        )}
                      </div>

                      <div className="absolute top-4 right-4 z-10">
                        <button
                          type="button"
                          onClick={handleOpenFullscreen}
                          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#222222] shadow-lg transition-all duration-300 hover:bg-white hover:scale-105"
                        >
                          <FaExpand />
                          Fullscreen
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollCarouselByTwo(-1)}
              className={`hidden lg:inline-flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center gap-2 rounded-full border border-[#00AEEF] bg-white/95 px-5 py-3 text-sm font-semibold text-[#00AEEF] shadow-xl backdrop-blur transition-all duration-300 hover:bg-[#00AEEF] hover:text-white active:scale-95 ${
                scrollState.showLeft
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-label="See less videos"
            >
              <FaChevronLeft />
              See Less
            </button>
            <button
              type="button"
              onClick={() => scrollCarouselByTwo(1)}
              className={`hidden lg:inline-flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center gap-2 rounded-full bg-[#00AEEF] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:bg-[#0095CC] active:scale-95 ${
                scrollState.showRight
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-label="See more videos"
            >
              See More
              <FaChevronRight />
            </button>
          </div>
        </div>

        {isExpanded && getActiveVideoId(activeIndex) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-sm md:px-12 md:py-16"
            onClick={handleCloseFullscreen}
          >
            <div
              className="relative w-full max-w-7xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCloseFullscreen}
                className="absolute -top-6 right-0 z-10 rounded-full bg-white/95 p-3 text-black shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white"
                aria-label="Close video"
              >
                <FaTimes />
              </button>

              <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
                <div className="aspect-video w-full">
                  <div
                    ref={fullscreenPlayerContainerRef}
                    id={`trust-fullscreen-player-${activeIndex}`}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 text-center">
          <h3 className="text-[#222222] text-3xl font-bold mb-6">
            Ready to Partner with Excellence?
          </h3>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Join the growing list of satisfied partners who trust Kite brand for
            quality, reliability, and innovation in FMCG products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-[#00AEEF] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#0095CC] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              Get in Touch
            </Link>
            <Link
              to="/products"
              className="bg-transparent border-2 border-[#00AEEF] text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-[#00AEEF] hover:text-white transition-all duration-300 active:scale-95"
            >
              Explore Our Brands
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
