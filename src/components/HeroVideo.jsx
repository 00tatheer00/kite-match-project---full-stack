'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSettings } from '../services/api';

const HeroVideo = () => {
  const videoRef = useRef(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getSettings()
      .then((data) => {
        if (isMounted && data) setSettings(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Guarantee seamless autoplay across all browsers and devices
  useEffect(() => {
    if (settings?.bannerType === 'image' && settings?.bannerImage) return;
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
  }, [settings]);

  const isImageBanner = settings?.bannerType === 'image' && Boolean(settings?.bannerImage);

  if (isImageBanner) {
    const bannerContent = (
      <div className="relative w-full overflow-hidden min-h-[45vh] sm:min-h-[60vh] md:min-h-[75vh] max-h-[100vh] bg-slate-900 flex items-center justify-center">
        {/* Responsive picture with desktop and optional mobile image */}
        <picture className="w-full h-full block">
          {settings.bannerMobileImage && (
            <source
              media="(max-width: 768px)"
              srcSet={settings.bannerMobileImage}
            />
          )}
          <img
            src={settings.bannerImage}
            alt={settings.bannerTitle || "Kite Brand Banner"}
            className="w-full h-full object-cover object-center block"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>
    );

    return (
      <section
        id="home"
        aria-label={settings.bannerTitle || "Kite Brand Banner"}
        className="relative w-full overflow-hidden bg-black"
      >
        {settings.bannerLink ? (
          <Link href={settings.bannerLink} className="block w-full cursor-pointer">
            {bannerContent}
          </Link>
        ) : (
          bannerContent
        )}
      </section>
    );
  }

  return (
    <section
      id="home"
      aria-label="Kite Brand Motion Video Banner"
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Banner-sized video: fills width and height completely with object-fit: cover */}
      <div className="relative w-full overflow-hidden h-[100vh] min-h-[400px]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/videos/kite-motion-poster.jpg"
          aria-label="Kite Motion Banner"
          className="absolute inset-0 w-full h-full object-cover object-center block"
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        >
          {/* Phones/tablets get the 6.7 MB encode; large screens get the 21.8 MB master.
              Browsers without <source media> support use the first (lighter) source. */}
          <source src="/videos/kite-motion-banner.mp4" type="video/mp4" media="(max-width: 1024px)" />
          <source src="/videos/Kite%20Motion%20Banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default HeroVideo;
