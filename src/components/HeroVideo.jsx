'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSettings } from '../services/api';

// Phones: 16:9 frame. Tablets/desktops: everything between the header and the bottom of the
// screen. Pages render at zoom var(--home-scale) (globals.css), so the height is divided by it.
const HERO_SIZE = "hero-frame relative w-full overflow-hidden";

const HeroVideo = ({ initialSettings = null }) => {
  const videoRef = useRef(null);
  // Server-provided banner settings avoid a video→image swap (layout shift) after load.
  const [settings, setSettings] = useState(initialSettings);

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

  // The poster (32 KB WebP) is painted first. The video file is only attached after the
  // page has finished loading, so it never competes with the poster, fonts or scripts
  // for bandwidth on slow mobile connections.
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    if (settings?.bannerType === 'image' && settings?.bannerImage) return undefined;
    let timer;
    const start = () => {
      timer = window.setTimeout(() => setLoadVideo(true), 300);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      window.clearTimeout(timer);
    };
  }, [settings]);

  // Guarantee seamless autoplay across all browsers and devices
  useEffect(() => {
    if (!loadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.load();

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked (e.g. data saver): the poster image stays visible.
      });
    }
  }, [loadVideo]);

  const isImageBanner = settings?.bannerType === 'image' && Boolean(settings?.bannerImage);

  if (isImageBanner) {
    const bannerContent = (
      <div className={`${HERO_SIZE} bg-slate-900 flex items-center justify-center`}>
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
      <div className={HERO_SIZE}>
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="none"
          /* The poster is in the server HTML (and preloaded), so this <video> is the
             Largest Contentful Paint element from the first paint. The video file itself
             is attached after the page has loaded and never re-times LCP. */
          poster="/videos/kite-hero-poster-1280.webp"
          aria-label="Kite Motion Banner"
          className="absolute inset-0 w-full h-full object-cover object-center block"
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        >
          {/* Phones/tablets get the 720p encode (~2 MB); large screens the 1080p one (~4.5 MB).
              Browsers without <source media> support use the first (lighter) source. */}
          {loadVideo && <source src="/videos/kite-hero-720.mp4" type="video/mp4" media="(max-width: 1024px)" />}
          {loadVideo && <source src="/videos/kite-hero-1080.mp4" type="video/mp4" />}
        </video>
      </div>
    </section>
  );
};

export default HeroVideo;
