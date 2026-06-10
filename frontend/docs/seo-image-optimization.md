# SEO Image Optimization Checklist

Use this checklist when converting and shipping images for better Core Web Vitals and crawlability.

## Priority Conversion Targets

- `src/components/HeroCarousel.jsx` hero assets: create WebP + AVIF variants and keep JPEG fallback.
- `src/components/SafetyMatchesExport.jsx` hero/map/shipment imagery: convert static JPEG/PNG to WebP.
- `src/components/WoodenSplintsExport.jsx` showcase/CTA imagery: convert to WebP.
- `src/components/about/LeaderProfile.jsx` and `src/components/AboutSection.jsx` people photos: generate compressed WebP versions.
- `src/components/PromotionsPackagesSection.jsx` package images from CMS/backend: upload WebP versions where possible.

## Delivery Rules

- Keep hero/LCP images `loading="eager"` and set intrinsic dimensions.
- Keep non-hero images `loading="lazy"` and `decoding="async"`.
- Prefer responsive sources (`srcSet`) for assets shown in multiple viewport sizes.
- Aim for <= 200 KB for card images and <= 350 KB for hero images after compression.
- Use meaningful `alt` text for informative images; keep decorative images empty alt.

## Validation

- Run Lighthouse mobile and verify LCP image requests are optimized.
- Confirm no new layout shift from changed image dimensions.
- Verify image URLs are crawlable (not blocked by auth or robots).
