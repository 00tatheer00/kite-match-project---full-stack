import WoodenSplintsExport from "../components/WoodenSplintsExport";
import SeoHead from "../components/seo/SeoHead";

const WoodenSplintsPage = () => {
  return (
    <>
      <SeoHead
        title="Wooden Splints Export"
        description="Premium wooden splints for international buyers with custom sizing and dependable export services."
        path="/export/wooden-splints"
      />
      <div className="min-h-screen">
        <WoodenSplintsExport />
      </div>
    </>
  );
};

export default WoodenSplintsPage;
