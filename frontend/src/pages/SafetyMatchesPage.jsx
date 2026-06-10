import SafetyMatchesExport from "../components/SafetyMatchesExport";
import SeoHead from "../components/seo/SeoHead";

const SafetyMatchesPage = () => {
  return (
    <>
      <SeoHead
        title="Safety Matches Export"
        description="Export-grade safety matches from Kite Brand, trusted globally with reliable quality and logistics support."
        path="/export/safety-matches"
      />
      <div className="min-h-screen">
        <SafetyMatchesExport />
      </div>
    </>
  );
};

export default SafetyMatchesPage;
