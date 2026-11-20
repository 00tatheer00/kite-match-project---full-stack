import AdminAnalyticsPage from "@/pages-source/AdminAnalyticsPage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Traffic & Visitor Analytics | Kite Admin",
  description: "Monitor website visitors, referral sources, WhatsApp leads, and traffic channels.",
};

export default function Page() {
  return <AdminAnalyticsPage />;
}
