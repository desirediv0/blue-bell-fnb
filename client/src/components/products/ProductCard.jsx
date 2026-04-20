"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, ShoppingBag, Zap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const calculateDiscountPercentage = (regularPrice, salePrice) => {
  if (!regularPrice || !salePrice || regularPrice <= salePrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

const parsePrice = (value) => {
  if (value === null || value === undefined) return null;
  if (value === 0) return 0;
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(parsed) ? null : parsed;
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export const ProductCard = ({ product }) => {
  const { isAuthenticated }             = useAuth();
  const { addToCart }                   = useCart();
  const router                          = useRouter();

  const [isHovered,          setIsHovered]          = useState(false);
  const [isAddingToCart,     setIsAddingToCart]     = useState(false);
  const [wishlistItems,      setWishlistItems]      = useState({});
  const [isAddingToWishlist, setIsAddingToWishlist] = useState({});
  const [currentImageIndex,  setCurrentImageIndex]  = useState(0);
  const [priceSettings,      setPriceSettings]      = useState(null);
  const [addedToCart,        setAddedToCart]        = useState(false);

  /* ── Fetch wishlist ── */
  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((res) => {
        const map = res.data?.wishlistItems?.reduce((acc, item) => {
          acc[item.productId] = true;
          return acc;
        }, {}) || {};
        setWishlistItems(map);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  /* ── Fetch price visibility ── */
  useEffect(() => {
    fetchApi("/public/price-visibility-settings")
      .then((res) => { if (res.success) setPriceSettings(res.data); })
      .catch(() => setPriceSettings({ hidePricesForGuests: false }));
  }, []);

  /* ── All product images ── */
  const getAllProductImages = useMemo(() => {
    const images   = [];
    const imageUrls = new Set();
    const push = (raw) => {
      const url = raw?.url || raw;
      if (!url) return;
      const full = getImageUrl(url);
      if (!imageUrls.has(full)) { imageUrls.add(full); images.push(full); }
    };
    product.variants?.forEach((v) => v.images?.forEach(push));
    product.images?.forEach(push);
    if (images.length === 0 && product.image) push(product.image);
    if (images.length === 0) images.push("/placeholder.jpg");
    return images;
  }, [product]);

  /* ── Auto-rotate on hover ── */
  useEffect(() => {
    if (!isHovered || getAllProductImages.length <= 1) { setCurrentImageIndex(0); return; }
    const t = setInterval(() => setCurrentImageIndex((p) => (p + 1) % getAllProductImages.length), 2500);
    return () => clearInterval(t);
  }, [isHovered, getAllProductImages.length]);

  /* ── Price logic ── */
  const basePriceField    = parsePrice(product.basePrice);
  const regularPriceField = parsePrice(product.regularPrice);
  const priceField        = parsePrice(product.price);
  const salePriceField    = parsePrice(product.salePrice);

  const hasFlashSale            = product.flashSale?.isActive === true;
  const flashSalePrice          = hasFlashSale ? parsePrice(product.flashSale.flashSalePrice) : null;
  const flashSaleDiscountPercent = hasFlashSale ? product.flashSale.discountPercentage : 0;

  let hasSale = product.hasSale !== undefined && product.hasSale !== null ? Boolean(product.hasSale) : false;
  if (!hasSale && salePriceField !== null && salePriceField > 0) {
    if ((regularPriceField && salePriceField < regularPriceField) || (priceField && salePriceField < priceField))
      hasSale = true;
  }

  let originalPrice = null;
  let currentPrice  = 0;

  if (basePriceField !== null && regularPriceField !== null) {
    currentPrice  = basePriceField;
    originalPrice = hasSale && basePriceField < regularPriceField ? regularPriceField : null;
  } else if (salePriceField !== null && hasSale) {
    currentPrice  = salePriceField;
    originalPrice = priceField || basePriceField || regularPriceField || null;
  } else {
    currentPrice = basePriceField || regularPriceField || priceField || salePriceField || 0;
  }

  if (!currentPrice || isNaN(currentPrice)) currentPrice = 0;

  let displayPrice       = currentPrice;
  let showFlashSaleBadge = false;
  if (hasFlashSale && flashSalePrice !== null) {
    if (!originalPrice) originalPrice = currentPrice;
    displayPrice       = flashSalePrice;
    showFlashSaleBadge = true;
  }

  const discountPercent = showFlashSaleBadge
    ? flashSaleDiscountPercent
    : hasSale && originalPrice && currentPrice
      ? calculateDiscountPercentage(originalPrice, currentPrice)
      : 0;

  const showPrice = !priceSettings?.hidePricesForGuests || isAuthenticated;

  /* ── Wishlist toggle ── */
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}`); return; }

    setIsAddingToWishlist((p) => ({ ...p, [product.id]: true }));
    try {
      if (wishlistItems[product.id]) {
        const res  = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = res.data?.wishlistItems?.find((i) => i.productId === product.id);
        if (item) {
          await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" });
          setWishlistItems((p) => { const n = { ...p }; delete n[product.id]; return n; });
        }
      } else {
        await fetchApi("/users/wishlist", {
          method: "POST", credentials: "include",
          body: JSON.stringify({ productId: product.id }),
        });
        setWishlistItems((p) => ({ ...p, [product.id]: true }));
      }
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsAddingToWishlist((p) => ({ ...p, [product.id]: false }));
    }
  };

  /* ── Add to cart ── */
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showPrice) { toast.error("Please login to purchase items"); return; }

    const variantId = product.variants?.[0]?.id;
    if (!variantId) {
      toast.error("Select options on product page");
      router.push(`/products/${product.slug}`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(variantId, 1);
      setAddedToCart(true);
      toast.success("Added to bag!");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const inWishlist = wishlistItems[product.id];

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div
      className="group relative bg-white rounded overflow-hidden flex flex-col h-full border border-gray-100 transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image area ── */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* ── Badges (top-left) ── */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {showFlashSaleBadge && discountPercent > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md border border-white/20 uppercase tracking-wider backdrop-blur-sm">
              <Zap className="h-3 w-3 fill-white animate-pulse" />
              <span>{discountPercent}% OFF</span>
            </div>
          )}
          {!showFlashSaleBadge && hasSale && discountPercent > 0 && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md border border-white/20 uppercase tracking-wider">
              {discountPercent}% OFF
            </div>
          )}
        </div>


        {/* ── Wishlist (top-right) ── */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist[product.id]}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
            inWishlist
              ? "bg-red-50 text-red-500"
              : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-400"
          }`}
        >
          {isAddingToWishlist[product.id] ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Heart className={`h-3.5 w-3.5 transition-transform duration-200 ${inWishlist ? "fill-red-500 scale-110" : "group-hover:scale-110"}`} />
          )}
        </button>

        {/* ── Main image ── */}
        <Image
          src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* ── Image dots ── */}
        {getAllProductImages.length > 1 && isHovered && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
            {getAllProductImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? "w-4 bg-white shadow-sm" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── "View" hint on hover ── */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </Link>

      {/* ── Info area ── */}
      <div className="flex flex-col flex-grow p-3 gap-2">

        {/* Name */}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`h-2.5 w-2.5 flex-shrink-0 ${s <= Math.round(product.avgRating) ? "text-amber-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[10px] text-gray-400 ml-0.5">{product.avgRating}</span>
          </div>
        )}

        {/* Price + Add to Cart */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between gap-2">

          {/* Price block */}
          <div className="leading-tight min-w-0">
            {showPrice ? (
              <>
                <p className={`text-sm font-bold truncate ${showFlashSaleBadge ? "text-primary" : "text-gray-900"}`}>
                  {formatCurrency(displayPrice)}
                </p>
                {(hasSale || showFlashSaleBadge) && originalPrice && (
                  <p className="text-[11px] text-gray-400 line-through leading-none mt-0.5">
                    {formatCurrency(originalPrice)}
                  </p>
                )}
              </>
            ) : (
              <Link href="/auth?redirect=products" className="text-xs text-primary hover:underline font-medium">
                Login to view price
              </Link>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!showPrice || isAddingToCart}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 active:scale-95 disabled:opacity-50
              ${addedToCart
                ? "bg-green-500 text-white"
                : "bg-primary text-white hover:bg-primary/90"
              }`}
          >
            {isAddingToCart ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : addedToCart ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;