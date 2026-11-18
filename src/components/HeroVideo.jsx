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
      {/* 
        Fits strictly within the single screen (above the fold) without vertical overflow:
        - Mobile: natural 16:9 aspect ratio or max-h bounded
        - Tablet/Desktop: exactly fits the remaining screen height (100dvh - navbar)
      */}
      <div className="relative w-full aspect-video sm:aspect-auto sm:h-[calc(100dvh-80px)] md:h-[calc(100dvh-92px)] max-h-[calc(100dvh-70px)] sm:max-h-[calc(100dvh-80px)] md:max-h-[calc(100dvh-92px)] overflow-hidden">
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
