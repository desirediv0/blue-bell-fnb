import { Factory, ShieldCheck, Phone, Truck } from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   DATA — specific numbers build trust
───────────────────────────────────────────── */
const STATS = [
  { value: "10,000+", label: "Happy Families Served" },
  { value: "15 yrs",  label: "Dairy Excellence" },
  { value: "100%",   label: "Pure & Organic" },
  { value: "₹499",   label: "Min order for Free Delivery" },
];

const PROMISES = [
  {
    icon: Factory,
    title: "Farm to home direct",
    body:  "We source directly from our local farms. No distributors or middlemen — just pure, fresh dairy delivered straight to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Freshness & Purity Guarantee",
    body:  "Every batch is tested for freshness. Not happy with the quality? We replace it immediately. No questions, no compromised quality.",
  },
  {
    icon: Phone,
    title: "Dedicated Farm Support",
    body:  "Call +91 7303249605 or write to contact@bluebellfnb.com. Our support team is here to help with your daily dairy needs.",
  },
  {
    icon: Truck,
    title: "Free delivery above ₹499",
    body:  "Orders above ₹499 ship free. We use temperature-controlled packaging to ensure your products stay fresh during transit.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export const WhyBuySection = () => {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">

        {/* ── Top: label + heading ── */}
        <div className="mb-12 md:mb-16">
          <span className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-3">
            Why Blue Bell FNB
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight max-w-md">
              From Our Farms.<br />To Your Family.
            </h2>
            <p className="text-sm text-gray-500 max-w-xs md:text-right leading-relaxed">
              We&apos;ve been providing premium dairy products since 2009.
              Everything comes from our certified local farms in India.
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-100 rounded-2xl overflow-hidden mb-12 md:mb-16">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={`px-6 py-6 md:py-8 ${i !== 0 ? "border-l border-gray-100" : ""} ${i >= 2 ? "border-t md:border-t-0 border-gray-100" : ""}`}
            >
              <p className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Promises: horizontal rows, not cards ── */}
        <div className="space-y-0 divide-y divide-gray-100">
          {PROMISES.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-5 py-6 group"
            >
              {/* Icon — small, left-aligned, no colored bg */}
              <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                <item.icon className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mt-0.5 sm:mt-0">
                    {item.body}
                  </p>
                </div>
              </div>

              {/* Index number */}
              <span className="flex-shrink-0 text-[11px] font-medium text-gray-300 mt-1 tabular-nums hidden sm:block">
                0{i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Have a specific requirement? Our team will help you spec the right system.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Talk to us
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default WhyBuySection;