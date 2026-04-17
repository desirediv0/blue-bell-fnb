"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube, ArrowUpRight } from "lucide-react";
import { fetchApi } from "@/lib/utils";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const PARTNER_PORTAL_URL = process.env.NEXT_PUBLIC_PARTNER_URL || "https://partner.bluebellfnb.com/login";

const COMPANY_LINKS = [
  { label: "About Us",        href: "/about"           },
  { label: "Contact",         href: "/contact"         },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy",   href: "/return-policy"   },
  { label: "FAQs",            href: "/faqs"            },
];

const SOCIALS = [
  { name: "Instagram", href: "https://www.instagram.com/official_bluebellfnb/",                        icon: Instagram },
  { name: "Facebook",  href: "https://www.facebook.com/share/1DCsKYB5Uy/?mibextid=wwXIfr",            icon: Facebook  },
  { name: "YouTube",   href: "https://youtube.com/@bluebellfnbindia?si=ZkkCpU1DEh48NBSe",             icon: Youtube   },
];

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
export const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories((res.data?.categories || []).slice(0, 8)))
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <footer
      className="text-slate-200"
      style={{ background: "linear-gradient(160deg, #1e2d40 0%, #172234 60%, #111c2b 100%)" }}
    >

      {/* ── Top accent line ── */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #3b82f6 40%, #60a5fa 60%, transparent)" }} />

      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-5 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-12">

          {/* ── Brand col (spans 2) ── */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="Blue Bell FNB"
                width={130}
                height={52}
                className="h-16 w-auto rounded"
              />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-7 max-w-[260px]">
              Premium dairy products sourced from fresh farms and delivered to your doorstep since 1998. Pure. Fresh. Local.
            </p>

            {/* Contact details */}
            <ul className="space-y-3 mb-7">
              <li>
                <a
                  href="mailto:admin@bluebellservice.co.in"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-blue-300 transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-blue-400" />
                  </span>
                  admin@bluebellservice.co.in
                </a>
              </li>
              <li>
                <a
                  href="tel:+917303249605"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-blue-300 transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-blue-400" />
                  </span>
                  +91 73032 49605
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  </span>
                  <span>Delhi NCR – Uttar Pradesh 201102</span>
                </div>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-400/40 flex items-center justify-center transition-all duration-200"
                >
                  <s.icon className="h-4 w-4 text-slate-400 group-hover:text-blue-300" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Shop col ── */}
          <div className="col-span-1 md:col-span-2">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-400/70 mb-5">
              Shop
            </p>
            <ul className="space-y-3">
              {loadingCats ? (
                [1,2,3,4].map((i) => (
                  <li key={i} className="h-4 rounded-md bg-white/5 animate-pulse" style={{ width: `${60 + i * 15}px` }} />
                ))
              ) : categories.length > 0 ? (
                <>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-1">
                    <Link
                      href="/categories"
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      All categories <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">
                    All Products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* ── Company col ── */}
          <div className="col-span-1">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-400/70 mb-5">
              Company
            </p>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Partner col ── */}
          <div className="col-span-1">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-400/70 mb-5">
              Partners
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/become-partner"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
                  </span>
                  Become a partner
                </Link>
              </li>
              <li>
                <a
                  href={PARTNER_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Partner login
                </a>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-8">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-400/70 mb-3">
                We accept
              </p>
              <div className="flex flex-wrap gap-2">
                {["UPI", "Visa", "MC", "COD", "Net Banking"].map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-400 font-semibold"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/8" />

      {/* ── Bottom bar ── */}
      <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Blue Bell FNB. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/privacy-policy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-700 text-xs">·</span>
          <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>

    </footer>
  );
};

export default Footer;