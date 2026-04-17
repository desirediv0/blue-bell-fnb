"use client"
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const STATS = [
  { value: "15+",     label: "Years Dairy Heritage" },
  { value: "20,000+", label: "Regular Customers"    },
  { value: "100+",    label: "Fresh Products"       },
  { value: "Fresh",   label: "Daily Delivery"       },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Sharma",
    role: "Food Blogger",
    city: "Mumbai",
    text: "Purity you can taste. Blue Bell FNB milk reminds me of my childhood visits to the farm. Consistent quality every morning delivered at 6 AM.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Cafe Owner",
    city: "Delhi",
    text: "The artisanal cheese and butter from Blue Bell FNB have elevated our breakfast menu. Our customers frequently ask about the source of such fresh ingredients!",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Health Coach",
    city: "Ahmedabad",
    text: "I recommend Blue Bell FNB to all my clients. Knowing it comes directly from local farms without middleman processing is huge for pure nutrition.",
    rating: 5,
  },
  {
    name: "Ananya Mehta",
    role: "Home Baker",
    city: "Pune",
    text: "The cream and paneer from Blue Bell FNB are unmatched — rich texture, no additives. My desserts have never tasted better. Customers keep coming back for more!",
    rating: 5,
  },
  {
    name: "Suresh Nair",
    role: "Restaurant Chef",
    city: "Bengaluru",
    text: "We switched our entire dairy supply to Blue Bell FNB six months ago. The freshness, consistency, and on-time delivery have made a visible difference in our kitchen.",
    rating: 5,
  },
];

/* ─────────────────────────────────────────────
   CAROUSEL COMPONENT
───────────────────────────────────────────── */
const TestimonialCarousel = () => {
  const [visibleCount, setVisibleCount] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef(null);

  // Detect visible count based on screen width
  useEffect(() => {
    const update = () => {
      setVisibleCount(window.innerWidth < 768 ? 1 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Build infinite clone array: clone end + original + clone start
  const cloned = [
    ...TESTIMONIALS.slice(-visibleCount),
    ...TESTIMONIALS,
    ...TESTIMONIALS.slice(0, visibleCount),
  ];

  const total = TESTIMONIALS.length;
  // Real start offset = visibleCount (because we prepended visibleCount clones)
  const offset = visibleCount;

  const [trackIndex, setTrackIndex] = useState(offset);

  const goTo = useCallback(
    (direction) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTrackIndex((prev) => prev + direction);
    },
    [isTransitioning]
  );

  // After transition ends, if we've gone past real bounds, snap silently
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    setTrackIndex((prev) => {
      if (prev <= offset - 1) return offset + total - 1;
      if (prev >= offset + total) return offset;
      return prev;
    });
  };

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;
    autoScrollRef.current = setInterval(() => {
      goTo(1);
    }, 3200);
    return () => clearInterval(autoScrollRef.current);
  }, [isPaused, goTo]);

  // Dot index (real position)
  const dotIndex = ((trackIndex - offset) % total + total) % total;


  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Track wrapper */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${(trackIndex * 100) / cloned.length}%)`,
            transition: isTransitioning ? "transform 0.55s cubic-bezier(0.4,0,0.2,1)" : "none",
            width: `${(cloned.length / visibleCount) * 100}%`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {cloned.map((t, i) => (
            <div
              key={i}
              style={{ width: `${100 / cloned.length}%` }}
              className="px-2"
            >
              <div className="flex flex-col gap-4 p-5 rounded-2xl border border-blue-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-blue-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-blue-600">
                      {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-none">{t.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {t.role} · {t.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav + Dots row */}
      <div className="flex items-center justify-between mt-6">
        {/* Dots */}
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (isTransitioning) return;
                setIsTransitioning(true);
                setTrackIndex(offset + i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === dotIndex ? "w-6 bg-blue-600" : "w-1.5 bg-blue-200"
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => goTo(-1)}
            disabled={isTransitioning}
            className="w-10 h-10 rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => goTo(1)}
            disabled={isTransitioning}
            className="w-10 h-10 rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────── */
export const TrustSection = () => {
  return (
    <section className="bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-blue-100 border border-blue-100 rounded-2xl overflow-hidden mb-16 bg-blue-50/40">
          {STATS.map((s, i) => (
            <div key={i} className="px-6 py-6 md:py-8">
              <p className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight leading-none mb-1.5">
                {s.value}
              </p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonials header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-10">
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase text-blue-600 mb-3">
              Customer stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Trusted by Families.
            </h2>
          </div>
          <p className="text-sm text-gray-400 max-w-xs md:text-right leading-relaxed">
            Loved by families, professional chefs, and health enthusiasts across India.
          </p>
        </div>

        {/* ── Carousel ── */}
        <TestimonialCarousel />

      </div>
    </section>
  );
};

export default TrustSection;