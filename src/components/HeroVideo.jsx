'use client';

import { useEffect, useRef } from 'react';

const HeroVideo = () => {
  const videoRef = useRef(null);

  // Guarantee seamless autoplay across all browsers and devices
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
      {/* Banner-sized video: fills width, capped height so products section peeks in */}
      <div className="relative w-full overflow-hidden h-[100vh]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/videos/kite-motion-poster.jpg"
          aria-label="Kite Motion Banner"
          className="w-full h-full object-cover object-center block"
        >
          {/* Pristine original high-bitrate master video */}
          <source src="/videos/Kite Motion Banner.mp4" type="video/mp4" />
          <source src="/videos/kite-motion-banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default HeroVideo;
