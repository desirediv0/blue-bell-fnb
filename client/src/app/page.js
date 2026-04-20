import CategoriesCarousel from "@/components/sections/CategoriesCarousel";
import HeroSection from "@/components/sections/HeroSection";
import { FlashSaleSection } from "@/components/sections/FlashSaleSection";
import AnnouncementBanner from "@/components/sections/AnnouncementBanner";
import BrandCarousel from "@/components/sections/BrandCarousel";
import HomePageContent from "@/components/sections/HomePageContent";
import { WhyBuySection } from "@/components/sections/WhyBuySection";
import { TrustSection } from "@/components/sections/TrustSection";
import { SocialMediaSection } from "@/components/sections/SocialMediaSection";


export const metadata = {
  title: "Blue Bell FNB | Premium Dairy Products & Fresh Farm Milk",
  description: "Shop fresh milk, organic butter, artisanal cheese, and premium dairy products at Blue Bell FNB. Pure quality delivered from farm to your home.",
};

export default function Home() {
  return (
    <>
      <main>
        {/* ── Top Section ── */}
        <CategoriesCarousel />
        <HeroSection />
        <AnnouncementBanner />

        {/* ── Brand Showcase ── */}
        <BrandCarousel tag="TOP" title="TOP BRANDS" />

        {/* ── Flash Sale ── */}
        <FlashSaleSection />

        {/* ── All Product Sections + HOT BRANDS (client-side, API driven) ── */}
        <HomePageContent />

        {/* ── Bottom Brand Showcase ── */}
        <BrandCarousel tag="NEW" title="NEW BRANDS" />

        {/* ── Trust & Social ── */}
        <WhyBuySection />
        <TrustSection />
        <SocialMediaSection />
      </main>
    </>
  );
}
