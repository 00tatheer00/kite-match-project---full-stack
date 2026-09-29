'use client';

import { lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import HeroCarousel from "./HeroCarousel";
import BriefProductsSection from "./BriefProductsSection";
import AboutSection from "./AboutSection";
import BriefExport from "./BriefExport";

const BrandsShowcaseSection = lazy(() => import("./BrandsShowcaseSection"));
const MatchMakingSection = lazy(() => import("./MatchMakingSection"));
const CertificationsSlider = lazy(() => import("./CertificationsSlider"));
const TrustSection = lazy(() => import("./TrustSection"));

const SectionSkeleton = ({ minHeight = 280 }) => (
  <div
    style={{ minHeight }}
    className="w-full animate-pulse bg-slate-50/80 rounded-xl my-6"
    aria-hidden="true"
  />
);

const DeferredSection = ({ SectionComponent, minHeight }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "800px 0px",
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={<SectionSkeleton minHeight={minHeight} />}>
          <SectionComponent />
        </Suspense>
      ) : (
        <SectionSkeleton minHeight={minHeight} />
      )}
    </div>
  );
};

const HomePageContent = () => {
  return (
    <>
      {/* Semantic H1 for Top-Tier Search Engine Ranking (Mohsin Match Factory & Kite) */}
      <h1 className="sr-only">
        Mohsin Match Factory (Pvt.) Ltd. &amp; Kite Match — Best Match Factory in Pakistan &amp; Premier FMCG Manufacturer
      </h1>

      <HeroCarousel />
      <BriefProductsSection />
      <AboutSection />
      <BriefExport />
      <DeferredSection SectionComponent={BrandsShowcaseSection} minHeight={320} />
      <DeferredSection SectionComponent={MatchMakingSection} minHeight={620} />
      <DeferredSection SectionComponent={CertificationsSlider} minHeight={360} />
      <DeferredSection SectionComponent={TrustSection} minHeight={280} />
    </>
  );
};

export default HomePageContent;
