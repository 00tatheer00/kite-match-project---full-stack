'use client';

import { useEffect, useRef } from 'react';

const HeroVideo = () => {
  const videoRef = useRef(null);

  // Guarantee autoplay across all browsers (including iOS Safari / Low-Power Mode)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <section
      id="home"
      aria-label="Kite Brand Motion Video Banner"
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Exact 16:9 aspect ratio matching the 1920x1080 video dimensions */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/videos/kite-motion-poster.jpg"
          aria-label="Kite Motion Banner"
          className="w-full h-full object-cover block"
        >
          {/* Full original pristine quality master video (14.5 Mbps, 1080p, faststart) */}
          <source src="/videos/Kite Motion Banner.mp4" type="video/mp4" />
          {/* Fallback source */}
          <source src="/videos/kite-motion-banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default HeroVideo;
