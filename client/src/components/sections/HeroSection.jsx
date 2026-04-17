"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function normalizeSlide(slide) {
  return {
    img:      slide.img      || slide.desktopImage || "",
    smimg:    slide.smimg    || slide.mobileImage  || slide.desktopImage || slide.img || "",
    title:    slide.title    || slide.headline     || "",
    subtitle: slide.subtitle || slide.subheadline  || "",
    ctaLink:  slide.ctaLink  || slide.link         || "/products",
  };
}

function bannerToSlide(banner) {
  return normalizeSlide({
    img:      banner.desktopImage || "",
    smimg:    banner.mobileImage  || banner.desktopImage || "",
    title:    banner.title    || "",
    subtitle: banner.subtitle || "",
    ctaLink:  banner.link     || "/products",
  });
}

/* ─────────────────────────────────────────────
   FALLBACK DATA
   Desktop → 1600 × 700  (aspect 16/7)
   Mobile  → 800  × 1000 (aspect 4/5)
───────────────────────────────────────────── */
const FALLBACK_SLIDES = [
  {
    img:      "/hero-slide-1.png",      // 1600 × 700
    smimg:    "/hero-slide-sm1.png",    // 800  × 1000
    title:    "Fresh From Our Farms",
    subtitle: "Premium dairy products sourced directly from fresh farms, trusted by 50,000+ happy families",
    ctaLink:  "/products",
  },
  {
    img:      "/hero-slide-2.png",      // 1600 × 700
    smimg:    "/hero-slide-sm2.png",    // 800  × 1000
    title:    "Pure. Fresh. Local.",
    subtitle: "From creamy milk to artisan butter - experience dairy excellence at your doorstep",
    ctaLink:  "/products",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function HeroSection() {
  const [api,          setApi]          = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay,     setAutoplay]     = useState(true);
  const [isMobile,     setIsMobile]     = useState(false);
  const [slides,       setSlides]       = useState(FALLBACK_SLIDES);
  const [isLoading,    setIsLoading]    = useState(true);

  const router = useRouter();

  /* ── Responsive check ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Fetch banners ── */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetchApi("/public/banners");
        const bannersArray = response?.data?.banners;
        if (Array.isArray(bannersArray) && bannersArray.length > 0) {
          setSlides(bannersArray.map(bannerToSlide));
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  /* ── Autoplay ── */
  useEffect(() => {
    if (!api || !autoplay) return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api, autoplay]);

  /* ── Dot sync ── */
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrentSlide(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  const handleSlideClick = (ctaLink) => router.push(ctaLink || "/products");

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden">
        {/* Desktop skeleton: 16/7 | Mobile skeleton: 4/5 */}
        <div className="w-full aspect-[4/5] md:aspect-[16/7] bg-gradient-to-br from-blue-50 to-blue-100 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="p-0">
              <div
                className="relative w-full cursor-pointer overflow-hidden
                            aspect-[4/5] md:aspect-[16/5]"
           
                onClick={() => handleSlideClick(slide.ctaLink)}
              >
                <Image
                  src={isMobile ? slide.smimg : slide.img}
                  alt={slide.title || `Slide ${index + 1}`}
                  fill
                  className="object-cover object-center
                             transition-transform duration-700 hover:scale-[1.02]"
                  priority={index === 0}
                  sizes="(max-width: 767px) 800px, 1600px"
                  
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* ── Arrows (desktop only) ── */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex
                                     h-10 w-10 z-30
                                     bg-white/20 hover:bg-white/50 border-white/30
                                     text-white backdrop-blur-sm transition-all" />
        <CarouselNext     className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex
                                     h-10 w-10 z-30
                                     bg-white/20 hover:bg-white/50 border-white/30
                                     text-white backdrop-blur-sm transition-all" />

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-6 h-2 bg-white shadow-md"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

        {/* ── Autoplay toggle (desktop only) ── */}
        <button
          onClick={() => setAutoplay((p) => !p)}
          aria-label={autoplay ? "Pause slideshow" : "Play slideshow"}
          className="absolute top-3 right-3 z-30 hidden md:flex
                     items-center justify-center h-8 w-8 rounded-full
                     bg-black/25 hover:bg-black/45 text-white
                     backdrop-blur-sm transition-all"
        >
          {autoplay ? (
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
            </svg>
          )}
        </button>
      </Carousel>
    </div>
  );
}