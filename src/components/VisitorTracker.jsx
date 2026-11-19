'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Don't track admin panel navigation as consumer traffic
    if (pathname && pathname.startsWith('/admin')) return;

    const fullUrl = window.location.href;
    if (lastTrackedPath.current === fullUrl) return;
    lastTrackedPath.current = fullUrl;

    const referrer = document.referrer || '';
    const utmSource = searchParams ? searchParams.get('utm_source') || searchParams.get('source') || searchParams.get('ref') || '' : '';
    const fbclid = searchParams ? searchParams.get('fbclid') : null;
    const gclid = searchParams ? searchParams.get('gclid') : null;

    // Detect Source App / Referrer
    let detectedSource = 'direct';
    const refLower = referrer.toLowerCase();
    const utmLower = utmSource.toLowerCase();

    if (
      utmLower.includes('whatsapp') || 
      refLower.includes('whatsapp') || 
      refLower.includes('api.whatsapp.com') || 
      refLower.includes('wa.me')
    ) {
      detectedSource = 'whatsapp';
    } else if (
      utmLower.includes('facebook') || 
      refLower.includes('facebook.com') || 
      refLower.includes('fb.com') || 
      refLower.includes('l.facebook.com') ||
      refLower.includes('m.facebook.com') ||
      fbclid
    ) {
      detectedSource = 'facebook';
    } else if (
      utmLower.includes('instagram') || 
      refLower.includes('instagram.com') ||
      refLower.includes('l.instagram.com')
    ) {
      detectedSource = 'instagram';
    } else if (
      utmLower.includes('google') || 
      refLower.includes('google.') || 
      gclid
    ) {
      detectedSource = 'google';
    } else if (
      utmLower.includes('tiktok') || 
      refLower.includes('tiktok.com')
    ) {
      detectedSource = 'tiktok';
    } else if (referrer && !refLower.includes(window.location.hostname.toLowerCase())) {
      detectedSource = 'referral';
    }

    // Detect Device
    const ua = navigator.userAgent || '';
    let device = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      device = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      device = 'mobile';
    }

    let tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {}

    // Check cached city in sessionStorage to prevent repeated external lookups
    let cachedCity = '';
    let cachedCountry = 'PK';
    try {
      cachedCity = sessionStorage.getItem('kite_geo_city') || '';
      cachedCountry = sessionStorage.getItem('kite_geo_country') || 'PK';
    } catch {}

    const sendTrackingData = (cityToUse, countryToUse) => {
      const payload = {
        path: pathname || '/',
        source: detectedSource,
        referrer: referrer ? referrer.slice(0, 200) : '',
        device,
        timeZone: tz,
        city: cityToUse || '',
        country: countryToUse || 'PK',
        timestamp: new Date().toISOString(),
        screen: `${window.innerWidth}x${window.innerHeight}`,
      };

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/track', JSON.stringify(payload));
        } else {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Ignore background analytics failures
      }
    };

    if (cachedCity) {
      sendTrackingData(cachedCity, cachedCountry);
    } else {
      // Async non-blocking GeoIP check
      fetch('https://ipwho.is/', { cache: 'force-cache' })
        .then((res) => res.json())
        .then((geo) => {
          if (geo && geo.success && geo.city) {
            const resolvedCity = `${geo.city}, ${geo.country_code || 'PK'}`;
            const resolvedCountry = geo.country_code || 'PK';
            try {
              sessionStorage.setItem('kite_geo_city', resolvedCity);
              sessionStorage.setItem('kite_geo_country', resolvedCountry);
            } catch {}
            sendTrackingData(resolvedCity, resolvedCountry);
          } else {
            sendTrackingData('', 'PK');
          }
        })
        .catch(() => {
          sendTrackingData('', 'PK');
        });
    }
  }, [pathname, searchParams]);

  return null;
}
