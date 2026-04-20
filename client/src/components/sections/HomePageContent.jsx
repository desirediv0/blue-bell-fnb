"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/utils";
import Headtext from "@/components/ui/headtext";
import BrandCarousel from "@/components/sections/BrandCarousel";
import { ProductCard } from "@/components/products/ProductCard";
import CategoryGrid from "@/components/sections/CategoryGrid";
import {
  Carousel,

  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

/* ─────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────── */
const ProductSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
    <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-16 bg-gray-200 rounded-full mx-auto" />
      <div className="h-4 w-full bg-gray-100 rounded" />
      <div className="h-4 w-3/4 mx-auto bg-gray-100 rounded" />
      <div className="h-6 w-20 bg-gray-200 rounded-full mx-auto" />
    </div>
  </div>
);

/* ─────────────────────────────────────
   REUSABLE PRODUCTS CAROUSEL
───────────────────────────────────── */
function FeaturedProductsCarousel({ products, isLoading }) {
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => api.scrollNext(), 3000);
    return () => clearInterval(interval);
  }, [api]);

  if (!isLoading && products.length === 0) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="relative mt-8">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {products.map((product, index) => (
            <CarouselItem
              key={product.id || product.slug || index}
              className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/5 py-2"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white border-gray-200 shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all z-10" />
        <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white border-gray-200 shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all z-10" />
      </Carousel>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */
export default function HomePageContent() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({
    featured: [],
    latest: [],
    bestseller: [],
    trending: [],
    new: [],
    protein: [],
    gainer: [],
    preWorkout: [],
    postWorkout: [],
    amino: [],
    creatine: [],
    fatBurner: [],
    vitamin: [],
    snack: [],
    drink: [],
    combo: [],
    elite: [],
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const endpoints = [
          { key: "featured",    url: "/public/products/type/featured?limit=12"  },
          { key: "latest",      url: "/public/products/type/latest?limit=12"    },
          { key: "bestseller",  url: "/public/products/type/bestseller?limit=12"},
          { key: "trending",    url: "/public/products/type/trending?limit=12"  },
          { key: "new",         url: "/public/products/type/new?limit=12"       },
        ];

        const results = await Promise.allSettled(
          endpoints.map(({ url }) => fetchApi(url))
        );

        const updated = { ...products };
        results.forEach((result, index) => {
          const key = endpoints[index].key;
          if (result.status === "fulfilled") {
            updated[key] = result.value?.data?.products || [];
          }
        });
        setProducts(updated);
      } catch (err) {
        console.error("Error fetching home products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSection = (key, title, description, bgClass = "bg-white") => {
    const sectionProducts = products[key];
    if (!loading && sectionProducts.length === 0) return null;

    return (
      <section className={`py-5 md:py-6 my-3 md:my-4 ${bgClass}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Headtext text={title} />
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">{description}</p>
          </div>

          <FeaturedProductsCarousel products={sectionProducts} isLoading={loading} />
        </div>
      </section>
    );
  };

  return (
    <>
      {/* FEATURED PRODUCTS */}
      {renderSection(
        "featured",
        "FEATURED PRODUCTS",
        "Farm-fresh dairy products delivered directly to your home",
        "bg-gray-50"
      )}

      {/* NEW BRANDS */}
      <BrandCarousel tag="NEW" title="NEW BRANDS" />

      {/* LATEST PRODUCTS */}
      {renderSection(
        "latest",
        "LATEST PRODUCTS",
        "Discover our newest additions to the collection",
        "bg-white"
      )}

      {/* BEST SELLERS */}
      {renderSection(
        "bestseller",
        "BEST SELLERS",
        "Our most popular products loved by customers",
        "bg-gray-50"
      )}

      {/* TRENDING */}
      {renderSection(
        "trending",
        "TRENDING NOW",
        "Our most loved products picked by the community",
        "bg-white"
      )}

            <CategoryGrid />

      {/* NEW ARRIVALS */}
      {renderSection(
        "new",
        "NEW ARRIVALS",
        "Fresh products just added to our collection",
        "bg-gray-50"
      )}

      {/* ========== NUTRITION SECTIONS START ========== */}

      {/* PROTEIN -> FRESH MILK & CREAM */}
      {renderSection(
        "protein",
        "FRESH MILK & CREAM",
        "Pure, homogenized and pasteurized milk for your daily needs",
        "bg-white"
      )}

      {/* GAINERS -> BUTTER & GHEE */}
      {renderSection(
        "gainer",
        "BUTTER & GHEE",
        "Rich, creamy butter and traditional pure cow ghee",
        "bg-gray-50"
      )}

      {/* PREWORKOUT -> CHEESE SELECTION */}
      {renderSection(
        "preWorkout",
        "CHEESE SELECTION",
        "From mozzarella to cheddar, explore our artisan cheeses",
        "bg-white"
      )}

      {/* POSTWORKOUT -> ORGANIC YOGURT */}
      {renderSection(
        "postWorkout",
        "ORGANIC YOGURT",
        "Thick, creamy yogurt and flavored curds for a healthy gut",
        "bg-gray-50"
      )}

      {/* BCAA / AMINO -> PANEER & TOFU */}
      {renderSection(
        "amino",
        "PANEER & TOFU",
        "Fresh, soft paneer and high-protein tofu alternatives",
        "bg-white"
      )}

      {/* HOT BRANDS */}
      <BrandCarousel tag="HOT" title="HOT BRANDS" />
    </>
  );
}
