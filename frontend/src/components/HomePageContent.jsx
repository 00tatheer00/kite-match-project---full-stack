import { lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import HeroCarousel from "./HeroCarousel";
import AboutSection from "./AboutSection";
import BriefExport from "./BriefExport";

const BriefProductsSection = lazy(() => import("./BriefProductsSection"));
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
    rootMargin: "320px 0px",
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
      <HeroCarousel />
      <DeferredSection SectionComponent={BriefProductsSection} minHeight={520} />
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
