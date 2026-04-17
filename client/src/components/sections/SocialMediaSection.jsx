import { Instagram, Facebook, Youtube, ArrowUpRight } from "lucide-react";

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@official_bluebellfnb",
    url: "https://www.instagram.com/official_bluebellfnb/",
    icon: Instagram,
    accent: "#E1306C",
    accentBg: "#fff0f5",
    desc: "Fresh recipes, farm stories & daily dairy inspiration",
  },
  {
    name: "Facebook",
    handle: "Blue Bell fnb India",
    url: "https://www.facebook.com/share/1DCsKYB5Uy/?mibextid=wwXIfr",
    icon: Facebook,
    accent: "#1877F2",
    accentBg: "#f0f5ff",
    desc: "Community discussions, offers & event coverage",
  },
  {
    name: "YouTube",
    handle: "@bluebellfnbindia",
    url: "https://youtube.com/@bluebellfnbindia?si=ZkkCpU1DEh48NBSe",
    icon: Youtube,
    accent: "#FF0000",
    accentBg: "#fff0f0",
    desc: "Farm tours, product quality tests & kitchen tips",
  },
];

export const SocialMediaSection = () => {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-3">
              Follow Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              We're active online.<br />Come find us.
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs md:text-right leading-relaxed">
            Fresh farm updates, healthy recipes and daily dairy inspiration — posted regularly.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-300"
            >
              {/* Top row: icon + arrow */}
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  style={{ background: s.accentBg }}
                >
                  <s.icon className="h-5 w-5" style={{ color: s.accent }} />
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                />
              </div>

              {/* Info */}
              <div>
                <p className="text-sm font-bold text-gray-900">{s.name}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: s.accent }}>
                  {s.handle}
                </p>
              </div>

              {/* Desc */}
              <p className="text-xs text-gray-500 leading-relaxed mt-auto">
                {s.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;