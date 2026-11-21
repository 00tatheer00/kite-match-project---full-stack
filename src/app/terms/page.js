import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for ordering Kite Brand products online from kitepk.com (Cash on Delivery across Pakistan).",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="21 November 2026">
      <p>
        These terms apply to orders placed on <strong>www.kitepk.com</strong>, operated by Mohsin Match Factory (Pvt.) Ltd.
        (&ldquo;Kite Brand&rdquo;, &ldquo;we&rdquo;), Plot No. 16, Sector B-1, Phase 5, Industrial Estate, Hayatabad, Peshawar, Pakistan.
        By placing an order you agree to these terms.
      </p>

      <h2>1. Orders</h2>
      <ul>
        <li>An order is a request to purchase. Our team calls or messages you on the phone number you provide to confirm it.</li>
        <li>We may decline or cancel an order (for example if a product is out of stock, the address cannot be served, or the details cannot be verified). You will not be charged for cancelled orders.</li>
        <li>You receive an order number and a confirmation email after placing an order.</li>
      </ul>

      <h2>2. Prices &amp; payment</h2>
      <ul>
        <li>All prices are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise.</li>
        <li>The amount shown at checkout (products plus delivery charges) is the amount payable.</li>
        <li>Payment is <strong>Cash on Delivery (COD)</strong>: you pay the courier when the order is delivered.</li>
        <li>Prices and package offers may change without notice; the price shown when you place the order applies to that order.</li>
      </ul>

      <h2>3. Delivery</h2>
      <ul>
        <li>We deliver across Pakistan through courier partners. Delivery times are estimates and may vary by city.</li>
        <li>Delivery charges are shown at checkout. Some promotional packages include free delivery.</li>
        <li>Please check the parcel on delivery and report damaged or missing items to us within 48 hours.</li>
      </ul>

      <h2>4. Returns &amp; replacements</h2>
      <ul>
        <li>Damaged, defective or incorrect items are replaced or refunded when reported within 48 hours of delivery with photos of the product and packaging.</li>
        <li>For hygiene and safety reasons, opened consumable products cannot be returned unless they are defective.</li>
      </ul>

      <h2>5. Product safety</h2>
      <p>Safety matches are flammable. Keep them away from children and heat, and use them only as directed on the packaging.</p>

      <h2>6. Contact</h2>
      <p>
        For order questions, contact <a href="mailto:sales@kitepk.com">sales@kitepk.com</a> or message us on{" "}
        <a href="https://wa.me/923018117666" target="_blank" rel="noopener noreferrer">WhatsApp</a>. General enquiries:{" "}
        <a href="mailto:info@kitepk.com">info@kitepk.com</a>.
      </p>
    </LegalPage>
  );
}
