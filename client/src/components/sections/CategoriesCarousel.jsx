"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { fetchApi } from "@/lib/utils";

// ✅ React Icons
import {
  FaDumbbell,
  FaAppleAlt,
  FaHeartbeat,
  FaTags,
} from "react-icons/fa";

const CategoriesCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // ✅ Icon mapping function
  const getCategoryIcon = (category) => {
    const name = category.name?.toLowerCase() || "";

    if (name.includes("fitness")) return <FaDumbbell size={28} />;
    if (name.includes("health")) return <FaHeartbeat size={28} />;
    if (name.includes("nutrition")) return <FaAppleAlt size={28} />;
    if (name.includes("offer")) return <FaTags size={28} />;

    return <FaDumbbell size={28} />;
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApi("/public/categories");

        if (response.success && response.data?.categories) {
          setCategories(response.data.categories);
        } else {
          setError(response.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Carousel navigation
  useEffect(() => {
    if (!api) return;

    const updateButtons = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    api.on("select", updateButtons);
    updateButtons();

    return () => api.off("select", updateButtons);
  }, [api]);

  // Category Card
  const CategoryCard = ({ category, index }) => {
    const isOffers =
      category.name?.toLowerCase().includes("offer") ||
      category.slug === "offers";

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        viewport={{ once: true }}
        className="flex flex-col items-center group cursor-pointer"
      >
        <motion.div
          className="relative bg-white rounded-xl p-1 mb-1 w-[64px] h-[64px] sm:w-[90px] sm:h-[90px] flex items-center justify-center shadow group-hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {isOffers ? (
            <div className="relative">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow">
                <span className="text-white text-lg sm:text-xl font-bold">
                  %
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden bg-gray-50 flex items-center justify-center">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name || "Category"}
                  width={200}
                  height={200}
                  className="object-contain sm:w-20 sm:h-20"
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-400 group-hover:text-blue-500 transition">
                  {getCategoryIcon(category)}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="text-center px-1 mt-1">
          <h3 className="text-[11px] sm:text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200 leading-tight max-w-[64px] sm:max-w-[72px] truncate">
            {category.name}
          </h3>
        </div>
      </motion.div>
    );
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 overflow-x-auto pb-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center animate-pulse flex-shrink-0"
        >
          <div className="bg-gray-200 rounded-2xl w-[100px] h-[100px] mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
        </div>
      ))}
    </div>
  );

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <SkeletonLoader />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="flex gap-2 md:gap-6">
            {categories.map((category, index) => (
              <CarouselItem
                key={category.id}
                className="basis-[72px] sm:basis-[80px] md:basis-[90px]"
              >
                <Link href={`/category/${category.slug}`}>
                  <CategoryCard category={category} index={index} />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default CategoriesCarousel;