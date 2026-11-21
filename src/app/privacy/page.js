import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How Kite Brand (Mohsin Match Factory) collects, uses and protects your personal information on kitepk.com.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="21 November 2026">
      <p>
        This policy explains how Mohsin Match Factory (Pvt.) Ltd. (&ldquo;Kite Brand&rdquo;, &ldquo;we&rdquo;) handles personal
        information collected through <strong>www.kitepk.com</strong>.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Order details:</strong> your name, mobile number, email address, delivery address, city and any order notes.</li>
        <li><strong>Anonymous usage data:</strong> pages visited, device type, traffic source and approximate city/country (derived from your connection). We do not store your IP address in our analytics.</li>
        <li><strong>Cart:</strong> your cart is saved in your own browser so it is still there when you come back.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To process, confirm and deliver your order, and to contact you about it.</li>
        <li>To send your order confirmation and status updates by email.</li>
        <li>To understand which pages and products are popular and improve the website.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>3. Who we share it with</h2>
      <ul>
        <li>Courier partners, only the details needed to deliver your order.</li>
        <li>Service providers that host and run the website for us: secure database hosting (Supabase), email delivery (Resend), website hosting (Vercel) and Google Analytics for aggregated traffic statistics.</li>
        <li>Authorities, where required by Pakistani law.</li>
      </ul>

      <h2>4. Security &amp; retention</h2>
      <p>
        Order data is stored in a secured database that only authorised Kite staff can access. We keep order records for as long
        as needed for delivery, customer service, accounting and legal obligations.
      </p>

      <h2>5. Your choices</h2>
      <p>
        You can ask us to see, correct or delete the personal information we hold about you by emailing{" "}
        <a href="mailto:info@kitepk.com">info@kitepk.com</a>. You can clear your saved cart at any time by clearing your browser data.
      </p>

      <h2>6. Contact</h2>
      <p>
        Mohsin Match Factory (Pvt.) Ltd., Plot No. 16, Sector B-1, Phase 5, Industrial Estate, Hayatabad, Peshawar, Pakistan —{" "}
        <a href="mailto:info@kitepk.com">info@kitepk.com</a>
      </p>
    </LegalPage>
  );
}
