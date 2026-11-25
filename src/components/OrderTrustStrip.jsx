import { FaMoneyBillWave, FaTruck, FaUndoAlt, FaIndustry } from "react-icons/fa";

// Facts only — each point matches the Terms page (COD, nationwide courier, 48-hour replacement).
const POINTS = [
  { Icon: FaMoneyBillWave, title: "Cash on Delivery", text: "Pay the courier when your order arrives" },
  { Icon: FaTruck, title: "Delivery all over Pakistan", text: "Delivery charges shown before you order" },
  { Icon: FaUndoAlt, title: "48-hour replacement", text: "Damaged or wrong item? We replace or refund" },
  { Icon: FaIndustry, title: "Direct from the factory", text: "Made in Peshawar since 1974" },
];

export default function OrderTrustStrip({ compact = false, className = "" }) {
  return (
    <ul
      aria-label="Why order from Kite"
      className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"} gap-3 ${className}`}
    >
      {POINTS.map(({ Icon, title, text }) => (
        <li key={title} className="flex items-start gap-2.5 rounded-xl border border-[#E0E0E0] bg-white p-3">
          <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-[#00AEEF] text-lg" />
          <span>
            <span className="block text-sm font-semibold text-[#222222]">{title}</span>
            {!compact && <span className="block text-xs text-[#666666] mt-0.5">{text}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
