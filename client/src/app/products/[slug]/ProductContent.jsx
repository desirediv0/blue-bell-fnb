"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import {
  Star, Minus, Plus, AlertCircle, ShoppingCart,
  Heart, ChevronRight, CheckCircle, Zap,
  Truck, ShieldCheck, RotateCcw, Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import ReviewSection from "./ReviewSection";
import { useAddVariantToCart } from "@/lib/cart-utils";
import { ProductCard } from "@/components/products/ProductCard";

/* ─────────────────────────────────────────────
   UTIL
───────────────────────────────────────────── */
const getImageUrl = (img) => {
  if (!img) return "/images/product-placeholder.jpg";
  if (img.startsWith("http")) return img;
  return `https://desirediv-storage.blr1.cdn.digitaloceanspaces.com/${img}`;
};

const calcDiscount = (reg, sale) => {
  if (!reg || !sale || reg <= sale) return 0;
  return Math.round(((reg - sale) / reg) * 100);
};

const TRUST = [
  { icon: Truck,       label: "Free shipping above ₹999" },
  { icon: ShieldCheck, label: "Pure & Organic"            },
  { icon: RotateCcw,   label: "Freshness Guaranteed"     },
  { icon: Package,     label: "Farm Direct Delivery"     },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function ProductContent({ slug }) {
  const [product,               setProduct]               = useState(null);
  const [relatedProducts,       setRelatedProducts]       = useState([]);
  const [loading,               setLoading]               = useState(true);
  const [error,                 setError]                 = useState(null);
  const [mainImage,             setMainImage]             = useState(null);
  const [selectedAttributes,    setSelectedAttributes]    = useState({});
  const [selectedVariant,       setSelectedVariant]       = useState(null);
  const [quantity,              setQuantity]              = useState(1);
  const [effectivePriceInfo,    setEffectivePriceInfo]    = useState(null);
  const [activeTab,             setActiveTab]             = useState("description");
  const [isAddingToWishlist,    setIsAddingToWishlist]    = useState(false);
  const [isInWishlist,          setIsInWishlist]          = useState(false);
  const [isAddingToCart,        setIsAddingToCart]        = useState(false);
  const [cartSuccess,           setCartSuccess]           = useState(false);
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [initialLoading,        setInitialLoading]        = useState(true);
  const [priceSettings,         setPriceSettings]         = useState(null);

  const { isAuthenticated } = useAuth();
  const router              = useRouter();
  const { addVariantToCart } = useAddVariantToCart();

  /* ── Slab pricing ── */
  const getEffectivePrice = (variant, qty) => {
    if (!variant) return null;
    const baseSalePrice = variant.salePrice ? parseFloat(variant.salePrice) : null;
    const basePrice     = variant.price     ? parseFloat(variant.price)     : 0;
    const originalPrice = baseSalePrice || basePrice;
    if (variant.pricingSlabs?.length > 0) {
      const sorted = [...variant.pricingSlabs].sort((a, b) => b.minQty - a.minQty);
      for (const slab of sorted) {
        if (qty >= slab.minQty && (slab.maxQty === null || qty <= slab.maxQty))
          return { price: slab.price, originalPrice, source: "SLAB", slab };
      }
    }
    return { price: originalPrice, originalPrice, source: "DEFAULT", slab: null };
  };

  /* ── Fetch product ── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true); setInitialLoading(true);
    fetchApi(`/public/products/${slug}`)
      .then((res) => {
        const pd = res.data.product;
        setProduct(pd);
        setRelatedProducts(res.data.relatedProducts || []);
        if (pd.images?.length) setMainImage(pd.images[0]);
        if (pd.variants?.length) {
          const combos = pd.variants
            .filter((v) => v.isActive && (v.stock > 0 || v.quantity > 0))
            .map((v) => ({ attributeValueIds: v.attributes?.map((a) => a.attributeValueId) || [], variant: v }));
          setAvailableCombinations(combos);
          if (pd.attributeOptions?.length) {
            const defaults = {};
            pd.attributeOptions.forEach((a) => { if (a.values?.length) defaults[a.id] = a.values[0].id; });
            setSelectedAttributes(defaults);
            const match = combos.find((c) => {
              const cIds = c.attributeValueIds.sort().join(",");
              return cIds === Object.values(defaults).sort().join(",");
            });
            const v = match?.variant || pd.variants[0];
            setSelectedVariant(v);
            const moq = v.moq || 1;
            setQuantity(moq);
            setEffectivePriceInfo(getEffectivePrice(v, moq));
          } else {
            const v = pd.variants[0];
            setSelectedVariant(v);
            const moq = v.moq || 1;
            setQuantity(moq);
            setEffectivePriceInfo(getEffectivePrice(v, moq));
          }
        }
      })
      .catch((err) => { console.error(err); setError(err.message); })
      .finally(() => { setLoading(false); setInitialLoading(false); });
  }, [slug]);

  /* ── Price visibility ── */
  useEffect(() => {
    fetchApi("/public/price-visibility-settings")
      .then((r) => { if (r.success) setPriceSettings(r.data); })
      .catch(() => setPriceSettings({ hidePricesForGuests: false }));
  }, []);

  /* ── Wishlist status ── */
  useEffect(() => {
    if (!isAuthenticated || !product) return;
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((r) => setIsInWishlist(r.data.wishlistItems?.some((i) => i.productId === product.id)))
      .catch(console.error);
  }, [isAuthenticated, product]);

  /* ── Attribute select ── */
  const handleAttributeChange = (attrId, valueId) => {
    const next = { ...selectedAttributes, [attrId]: valueId };
    setSelectedAttributes(next);
    const selIds = Object.values(next).sort();
    const match = availableCombinations.find((c) => {
      const cIds = c.attributeValueIds.sort();
      return cIds.length === selIds.length && cIds.every((id, i) => id === selIds[i]);
    });
    if (match) {
      setSelectedVariant(match.variant);
      const moq = match.variant.moq || 1;
      const qty = quantity < moq ? moq : quantity;
      if (quantity < moq) setQuantity(qty);
      setEffectivePriceInfo(getEffectivePrice(match.variant, qty));
    } else {
      setSelectedVariant(null); setEffectivePriceInfo(null);
    }
  };

  const getAvailableValues = (attrId) => {
    if (!product?.attributeOptions) return [];
    const attr = product.attributeOptions.find((a) => a.id === attrId);
    if (!attr?.values) return [];
    const others = { ...selectedAttributes }; delete others[attrId];
    const available = new Set();
    availableCombinations.forEach((c) => {
      const othIds = Object.values(others);
      if (othIds.length === 0 || othIds.every((id) => c.attributeValueIds.includes(id)))
        c.variant.attributes?.forEach((a) => { if (a.attributeId === attrId) available.add(a.attributeValueId); });
    });
    return attr.values.filter((v) => available.has(v.id));
  };

  /* ── Quantity ── */
  const handleQuantityChange = (delta) => {
    const moq   = selectedVariant?.moq || 1;
    const stock = selectedVariant?.stock || selectedVariant?.quantity || 0;
    const next  = quantity + delta;
    if (next < moq) return;
    if (stock > 0 && next > stock) return;
    setQuantity(next);
    if (selectedVariant) setEffectivePriceInfo(getEffectivePrice(selectedVariant, next));
  };

  /* ── Add to cart ── */
  const handleAddToCart = async () => {
    const v = selectedVariant || product?.variants?.[0];
    if (!v) return;
    setIsAddingToCart(true); setCartSuccess(false);
    try {
      const result = await addVariantToCart(v, quantity, product.name);
      if (result.success) { setCartSuccess(true); setTimeout(() => setCartSuccess(false), 3000); }
    } catch (err) { console.error(err); }
    finally { setIsAddingToCart(false); }
  };

  /* ── Wishlist ── */
  const handleWishlist = async () => {
    if (!isAuthenticated) { router.push(`/auth?redirect=/products/${slug}`); return; }
    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        const r = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = r.data.wishlistItems.find((i) => i.productId === product.id);
        if (item) { await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" }); setIsInWishlist(false); }
      } else {
        await fetchApi("/users/wishlist", { method: "POST", credentials: "include", body: JSON.stringify({ productId: product.id }) });
        setIsInWishlist(true);
      }
    } catch (err) { console.error(err); }
    finally { setIsAddingToWishlist(false); }
  };

  /* ── Images ── */
  const getImages = () => {
    if (selectedVariant?.images?.length) return selectedVariant.images;
    if (product?.images?.length) return product.images;
    const vwi = product?.variants?.find((v) => v.images?.length);
    return vwi?.images || [];
  };

  /* ── Price display ── */
  const PriceDisplay = () => {
    if (initialLoading)
      return <div className="h-10 w-40 bg-gray-100 rounded-xl animate-pulse" />;

    const hidePrices = priceSettings?.hidePricesForGuests && !isAuthenticated;
    if (hidePrices || priceSettings === null)
      return (
        <div>
          <p className="text-2xl font-bold text-gray-400">Login to view price</p>
          <Link href={`/auth?redirect=/products/${slug}`}
            className="mt-1.5 inline-block text-sm text-primary underline underline-offset-2">
            Sign in
          </Link>
        </div>
      );

    if (product?.flashSale?.isActive) {
      const disc = calcDiscount(parseFloat(product.basePrice), parseFloat(product.flashSale.flashSalePrice));
      return (
        <div className="space-y-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-black text-primary tracking-tight">
              {formatCurrency(product.flashSale.flashSalePrice)}
            </span>
            <span className="text-xl text-gray-400 line-through">{formatCurrency(product.basePrice)}</span>
            {disc > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-bold">
                <Zap className="h-3 w-3" />{disc}% OFF
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Inclusive of all taxes · Flash Sale</p>
        </div>
      );
    }

    if (selectedVariant) {
      const info = effectivePriceInfo || getEffectivePrice(selectedVariant, quantity);
      if (!info) return <p className="text-2xl font-bold text-gray-400">Price unavailable</p>;
      const disc = info.originalPrice > info.price ? calcDiscount(info.originalPrice, info.price) : 0;
      return (
        <div className="space-y-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-black text-primary tracking-tight">{formatCurrency(info.price)}</span>
            {info.originalPrice > info.price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatCurrency(info.originalPrice)}</span>
                {disc > 0 && <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">-{disc}%</span>}
              </>
            )}
          </div>
          {info.source === "SLAB" && (
            <p className="text-sm text-green-600 font-medium">Bulk price applied for {quantity} units</p>
          )}
          <p className="text-xs text-gray-400">Inclusive of all taxes</p>
        </div>
      );
    }

    const bp   = product?.basePrice    || 0;
    const rp   = product?.regularPrice || 0;
    const disc = product?.hasSale && rp > bp ? calcDiscount(rp, bp) : 0;
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-black text-primary tracking-tight">{formatCurrency(bp)}</span>
          {disc > 0 && (
            <>
              <span className="text-xl text-gray-400 line-through">{formatCurrency(rp)}</span>
              <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">-{disc}%</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">Inclusive of all taxes</p>
      </div>
    );
  };

  /* ── Loading / Error / Not found states ── */
  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-base text-gray-400">Loading product…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load product</h2>
      <p className="text-sm text-gray-500 mb-6">{error}</p>
      <Link href="/products"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
        Browse Products <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );

  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-yellow-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
      <p className="text-sm text-gray-500 mb-6">This product doesn't exist or has been removed.</p>
      <Link href="/products"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
        Browse Products <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );

  const images     = getImages();
  const primary    = mainImage && images.some((i) => i.url === mainImage.url)
    ? mainImage : (images.find((i) => i.isPrimary) || images[0]);
  const stock      = selectedVariant?.stock || selectedVariant?.quantity || 0;
  const outOfStock = selectedVariant && stock === 0;

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8 flex-wrap">
          <Link href="/"        className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href="/products" className="hover:text-gray-700 transition-colors">Products</Link>
          {(product.category || product.categories?.[0]?.category) && (
            <>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link
                href={`/category/${product.category?.slug || product.categories[0].category.slug}`}
                className="hover:text-gray-700 transition-colors"
              >
                {product.category?.name || product.categories[0].category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-gray-700 font-medium truncate max-w-[180px] sm:max-w-sm">{product.name}</span>
        </nav>

        {/* ─── Main product grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 xl:gap-16 mb-16">

          {/* ── LEFT: Image gallery ── */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 mb-3">
              {images.length > 0 ? (
                <Image
                  src={getImageUrl(primary?.url)}
                  alt={product.name}
                  fill
                  className="object-contain p-8 transition-all duration-300"
                  priority
                  sizes="(max-width: 1024px) 95vw, 50vw"
                />
              ) : (
                <Image src="/images/product-placeholder.jpg" alt={product.name} fill className="object-contain" />
              )}

              {/* Flash sale overlay badge */}
              {product.flashSale?.isActive && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold shadow-md">
                  <Zap className="h-3 w-3" />
                  FLASH SALE — {product.flashSale.discountPercentage}% OFF
                </div>
              )}

              {/* Wishlist on image corner */}
              <button
                onClick={handleWishlist}
                disabled={isAddingToWishlist}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-all ${
                  isInWishlist ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-400"
                }`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => {
                  const active = primary?.url === img.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all duration-150 bg-gray-50 ${
                        active ? "border-primary shadow-sm" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image src={getImageUrl(img.url)} alt="" fill className="object-contain p-1.5" sizes="72px" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="flex flex-col">

            {/* Brand */}
            {product.brand && (
              <Link
                href={`/brand/${product.brand.slug}`}
                className="text-xs font-bold tracking-[0.12em] uppercase text-primary mb-2.5"
              >
                {product.brand?.name ?? product.brand ?? product.brandName ?? ""}
              </Link>
            )}

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2.5 mb-6 pb-6 border-b border-gray-100">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.avgRating || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.avgRating ? `${product.avgRating} · ${product.reviewCount} reviews` : "No reviews yet"}
              </span>
            </div>

            {/* Flash sale banner */}
            {product.flashSale?.isActive && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">{product.flashSale.name || "Flash Sale"}</p>
                    <p className="text-xs text-blue-600 mt-0.5">Limited time offer</p>
                  </div>
                </div>
                <span className="text-xl font-black text-primary">{product.flashSale.discountPercentage}% OFF</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <PriceDisplay />
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-base text-gray-600 leading-relaxed mb-6 pb-6 border-b border-gray-100">
                {product.shortDescription}
              </p>
            )}

            {/* Attributes */}
            {product.attributeOptions?.map((attr) => {
              const values = getAvailableValues(attr.id);
              const selId  = selectedAttributes[attr.id];
              const selVal = values.find((v) => v.id === selId);
              return (
                <div key={attr.id} className="mb-6">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    {attr.name}
                    {selVal && (
                      <span className="ml-2 text-sm font-normal text-gray-500">— {selVal.value}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {values.length > 0 ? (
                      values.map((v) => {
                        const active = selId === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleAttributeChange(attr.id, v.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                              active
                                ? "border-primary bg-primary text-white shadow-sm"
                                : "border-gray-200 text-gray-700 bg-white hover:border-gray-400"
                            }`}
                          >
                            {v.value}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-400">No {attr.name.toLowerCase()} available</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Stock / MOQ indicators */}
            {(selectedVariant || outOfStock !== undefined) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedVariant && stock > 0 && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-50 border border-green-100 text-sm font-medium text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    In Stock · {stock} available
                  </span>
                )}
                {outOfStock && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    Out of Stock
                  </span>
                )}
                {selectedVariant?.moq > 1 && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-sm font-medium text-blue-700">
                    Min. order: {selectedVariant.moq} units
                  </span>
                )}
              </div>
            )}

            {/* Cart success */}
            {cartSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 mb-5 font-medium">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                Added to your bag!
              </div>
            )}

            {/* Quantity + Add to Cart + Wishlist */}
            <div className="flex items-center gap-3 mb-8">
              {/* Quantity */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= (selectedVariant?.moq || 1) || isAddingToCart}
                  className="w-10 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 h-12 flex items-center justify-center text-base font-bold text-gray-900 border-x-2 border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={(stock > 0 && quantity >= stock) || isAddingToCart}
                  className="w-10 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || outOfStock || (!selectedVariant && !product?.variants?.length)}
                className={`flex-1 h-12 flex items-center justify-center gap-2.5 rounded-xl text-base font-bold transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  cartSuccess
                    ? "bg-green-600 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Adding…
                  </>
                ) : cartSuccess ? (
                  <><CheckCircle className="h-5 w-5" /> Added!</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                disabled={isAddingToWishlist}
                className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border-2 transition-all ${
                  isInWishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Metadata */}
            {(selectedVariant?.sku || product.category) && (
              <div className="pt-5 border-t border-gray-100 space-y-2">
                {selectedVariant?.sku && (
                  <div className="flex gap-3 text-sm">
                    <span className="w-24 text-gray-400 flex-shrink-0">SKU</span>
                    <span className="text-gray-700">{selectedVariant.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex gap-3 text-sm">
                    <span className="w-24 text-gray-400 flex-shrink-0">Category</span>
                    <Link href={`/category/${product.category.slug}`} className="text-primary hover:underline">
                      {product.category.name}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mb-16">
          <div className="flex gap-0 border-b-2 border-gray-100 overflow-x-auto mb-8">
            {[
              { key: "description", label: "Description" },
              { key: "reviews",     label: `Reviews (${product.reviewCount || 0})` },
              { key: "shipping",    label: "Shipping & Returns" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-all ${
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl">
              <div
                className="prose prose-base text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || "" }}
              />
              {product.directions && (
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="text-base font-bold text-blue-900 mb-2">Directions for Use</h3>
                  <p className="text-base text-blue-800 leading-relaxed">{product.directions}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && <ReviewSection product={product} />}

          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
              {[
                {
                  title: "Shipping",
                  rows: [
                    ["Standard delivery",  "1–2 business days (Local)"],
                    ["Free shipping",      "On orders above ₹999"],
                    ["Express delivery",   "Same day delivery available"],
                  ],
                },
                {
                  title: "Returns",
                  rows: [
                    ["Condition",  "Unused, in original packaging"],
                    ["Process",    "Initiate from your account — we arrange pickup"],
                  ],
                },
              ].map(({ title, rows }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
                  <dl className="space-y-3.5">
                    {rows.map(([dt, dd]) => (
                      <div key={dt}>
                        <dt className="text-sm font-semibold text-gray-700">{dt}</dt>
                        <dd className="text-sm text-gray-500 mt-0.5">{dd}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Related Products ─── */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
              <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}