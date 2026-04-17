"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    SlidersHorizontal, X, ChevronDown, ChevronUp,
    ChevronRight, AlertCircle, Search, ChevronLeft,
    Zap,
} from "lucide-react";
import { ClientOnly } from "@/components/client-only";
import { toast } from "sonner";
import { ProductCard } from "@/components/products/ProductCard";
import CategoriesCarousel from "@/components/sections/CategoriesCarousel";

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="flex justify-between items-center pt-1">
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                    <div className="h-7 bg-gray-100 rounded-lg w-14" />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   FILTER SECTION (accordion item)
───────────────────────────────────────────── */
function FilterSection({ title, isOpen, onToggle, children }) {
    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{title}</span>
                {isOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                }
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-80 pb-3" : "max-h-0"}`}>
                <div className="px-4">{children}</div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ACTIVE FILTER CHIP
───────────────────────────────────────────── */
function FilterChip({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-primary/8 text-primary border border-primary/20 rounded-full text-[11px] font-medium">
            {label}
            <button onClick={onRemove} className="w-3.5 h-3.5 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors">
                <X className="h-2.5 w-2.5" />
            </button>
        </span>
    );
}

/* ─────────────────────────────────────────────
   MAIN CONTENT
───────────────────────────────────────────── */
function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const decodePlus = (s) => (s ? s.replace(/\+/g, " ") : "");
    const searchQuery = decodePlus(searchParams.get("search") || "");
    const categorySlug = searchParams.get("category") || "";
    const productType = searchParams.get("productType") || "";
    const colorId = searchParams.get("color") || "";
    const sizeId = searchParams.get("size") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sortParam = searchParams.get("sort") || "createdAt";
    const orderParam = searchParams.get("order") || "desc";
    const pageParam = parseInt(searchParams.get("page")) || 1;

    /* ── State ── */
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [allAttributes, setAllAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedColors, setSelectedColors] = useState(colorId ? [colorId] : []);
    const [selectedSizes, setSelectedSizes] = useState(sizeId ? [sizeId] : []);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [openSections, setOpenSections] = useState({ search: true, categories: true });
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [pagination, setPagination] = useState({ page: pageParam, limit: 20, total: 0, pages: 0 });

    const [filters, setFilters] = useState({
        search: searchQuery, category: categorySlug, productType,
        color: colorId, size: sizeId, minPrice, maxPrice,
        sort: sortParam, order: orderParam,
    });

    /* ── Sync searchInput with filters.search ── */
    useEffect(() => { setSearchInput(filters.search || ""); }, [filters.search]);

    /* ── Sync URL → filters ── */
    useEffect(() => {
        const fromURL = {
            search: searchQuery, category: categorySlug, productType,
            color: colorId, size: sizeId, minPrice, maxPrice,
            sort: sortParam, order: orderParam,
        };
        const same = Object.keys(fromURL).every((k) => String(filters[k] || "") === String(fromURL[k] || ""));
        if (!same) {
            setFilters(fromURL);
            setSelectedColors(colorId ? [colorId] : []);
            setSelectedSizes(sizeId ? [sizeId] : []);
            setPagination((p) => ({ ...p, page: 1 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, categorySlug, productType, colorId, sizeId, minPrice, maxPrice, sortParam, orderParam]);

    /* ── URL builder ── */
    const updateURL = (f) => {
        const pairs = [];
        const add = (k, v) => {
            if (v !== undefined && v !== null && v !== "")
                pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v)).replace(/%20/g, "+")}`);
        };
        add("search", f.search); add("category", f.category); add("productType", f.productType);
        add("color", f.color); add("size", f.size);
        add("minPrice", f.minPrice); add("maxPrice", f.maxPrice);
        if (f.sort !== "createdAt" || f.order !== "desc") { add("sort", f.sort); add("order", f.order); }
        router.push(pairs.length ? `?${pairs.join("&")}` : window.location.pathname, { scroll: false });
    };

    /* ── Fetch products ── */
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let response;
                if (filters.productType) {
                    const q = new URLSearchParams({ limit: String(pagination.limit * pagination.page) });
                    response = await fetchApi(`/public/products/type/${filters.productType}?${q}`);
                    const all = response.data?.products || [];
                    const s = (pagination.page - 1) * pagination.limit;
                    setProducts(all.slice(s, s + pagination.limit));
                    setPagination((p) => ({ ...p, total: all.length, pages: Math.ceil(all.length / p.limit) }));
                } else {
                    const q = new URLSearchParams({
                        page: String(pagination.page), limit: String(pagination.limit),
                        sort: ["createdAt", "updatedAt", "name", "featured"].includes(filters.sort) ? filters.sort : "createdAt",
                        order: filters.order,
                    });
                    if (filters.search) q.append("search", filters.search);
                    if (filters.category) q.append("category", filters.category);
                    if (filters.minPrice) q.append("minPrice", filters.minPrice);
                    if (filters.maxPrice) q.append("maxPrice", filters.maxPrice);

                    const attrIds = new Set();
                    if (selectedColors.length > 0) { q.append("color", selectedColors[0]); selectedColors.forEach((id) => attrIds.add(id)); }
                    if (selectedSizes.length > 0) { q.append("size", selectedSizes[0]); selectedSizes.forEach((id) => attrIds.add(id)); }
                    Object.keys(selectedAttributes).forEach((k) => {
                        if (k !== "color" && k !== "size") (selectedAttributes[k] || []).forEach((id) => attrIds.add(id));
                    });
                    if (attrIds.size > 0) q.append("attributeValueIds", [...attrIds].join(","));

                    response = await fetchApi(`/public/products?${q}`);
                    setProducts(response.data.products || []);
                    setPagination(response.data.pagination || {});
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.page, pagination.limit, selectedColors, selectedSizes, selectedAttributes]);

    /* ── Fetch filter options ── */
    useEffect(() => {
        Promise.all([
            fetchApi("/public/categories"),
            fetchApi("/public/filter-attributes"),
        ]).then(([catRes, attrRes]) => {
            setCategories(catRes.data.categories || []);
            setColors(attrRes.data.colors || []);
            setSizes(attrRes.data.sizes || []);
            if (Array.isArray(attrRes.data.attributes)) {
                setAllAttributes(attrRes.data.attributes);
            } else {
                const attrs = [];
                if (attrRes.data.colors?.length) attrs.push({ id: "color-attr", name: "Color", values: attrRes.data.colors });
                if (attrRes.data.sizes?.length) attrs.push({ id: "size-attr", name: "Size", values: attrRes.data.sizes });
                setAllAttributes(attrs);
            }
        }).catch(console.error);
    }, []);

    useEffect(() => { if (error) toast.error("Error loading products. Please try again."); }, [error]);

    /* ── Scroll top on page change ── */
    useEffect(() => {
        const t = setTimeout(() => {
            document.getElementById("products-main")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return () => clearTimeout(t);
    }, [pagination.page]);

    /* ── Handlers ── */
    const handleFilterChange = (name, value) => {
        if ((name === "minPrice" || name === "maxPrice") && value !== "") {
            const n = parseFloat(value);
            if (isNaN(n)) return;
            value = n.toString();
        }
        const nf = { ...filters, [name]: value };
        setFilters(nf);
        updateURL(nf);
        if (pagination.page !== 1) setPagination((p) => ({ ...p, page: 1 }));
        if (drawerOpen && window.innerWidth < 768 && !["minPrice", "maxPrice", "search"].includes(name))
            setDrawerOpen(false);
    };

    const handleAttrChange = (attrName, valueId) => {
        const k = attrName.toLowerCase();
        const cur = selectedAttributes[k] || [];
        const updated = cur.includes(valueId) ? cur.filter((id) => id !== valueId) : [valueId];
        setSelectedAttributes((p) => ({ ...p, [k]: updated }));
        if (k === "color") { setSelectedColors(updated); handleFilterChange("color", updated[0] || ""); }
        else if (k === "size") { setSelectedSizes(updated); handleFilterChange("size", updated[0] || ""); }
    };

    const clearFilters = () => {
        const cf = { search: "", category: "", productType: "", color: "", size: "", minPrice: "", maxPrice: "", sort: "createdAt", order: "desc" };
        setFilters(cf); setSelectedColors([]); setSelectedSizes([]); setSelectedAttributes({});
        updateURL(cf); setPagination((p) => ({ ...p, page: 1 }));
    };

    const handleSortChange = (e) => {
        const map = {
            newest: ["createdAt", "desc"], oldest: ["createdAt", "asc"],
            "price-low": ["createdAt", "asc"], "price-high": ["createdAt", "desc"],
            "name-asc": ["name", "asc"], "name-desc": ["name", "desc"],
        };
        const [sort, order] = map[e.target.value] || ["createdAt", "desc"];
        const nf = { ...filters, sort, order };
        setFilters(nf); updateURL(nf);
    };

    const handlePageChange = (p) => {
        if (p < 1 || p > pagination.pages) return;
        setPagination((prev) => ({ ...prev, page: p }));
        const params = new URLSearchParams(searchParams.toString());
        p > 1 ? params.set("page", p) : params.delete("page");
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    /* ── Active filter count ── */
    const activeCount = [
        filters.search, filters.category,
        selectedColors.length > 0, selectedSizes.length > 0,
        filters.minPrice, filters.maxPrice,
    ].filter(Boolean).length;

    /* ── Current sort value ── */
    const currentSort = () => {
        if (filters.sort === "name" && filters.order === "asc") return "name-asc";
        if (filters.sort === "name" && filters.order === "desc") return "name-desc";
        if (filters.sort === "createdAt" && filters.order === "asc") return "oldest";
        return "newest";
    };

    /* ── Sidebar panel (shared desktop + drawer) ── */
    const SidebarContent = () => (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">Filters</span>
                {activeCount > 0 && (
                    <button onClick={clearFilters} className="text-[11px] font-medium text-primary hover:underline">
                        Clear all ({activeCount})
                    </button>
                )}
            </div>

            {/* Search */}
            <FilterSection title="Search" isOpen={!!openSections.search} onToggle={() => setOpenSections((p) => ({ ...p, search: !p.search }))}>
                <form onSubmit={(e) => { e.preventDefault(); handleFilterChange("search", searchInput); }} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    <input
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                </form>
            </FilterSection>

            {/* Categories */}
            <FilterSection title="Categories" isOpen={!!openSections.categories} onToggle={() => setOpenSections((p) => ({ ...p, categories: !p.categories }))}>
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            <button
                                onClick={() => handleFilterChange("category", filters.category === cat.slug ? "" : cat.slug)}
                                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${filters.category === cat.slug ? "bg-primary/8 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <ChevronRight className={`h-3 w-3 flex-shrink-0 transition-transform ${filters.category === cat.slug ? "rotate-90 text-primary" : "text-gray-400"}`} />
                                {cat.name}
                            </button>
                            {cat.children?.length > 0 && (
                                <div className="ml-5 mt-0.5 space-y-0.5">
                                    {cat.children.map((child) => (
                                        <button
                                            key={child.id}
                                            onClick={() => handleFilterChange("category", filters.category === child.slug ? "" : child.slug)}
                                            className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors ${filters.category === child.slug ? "text-primary font-medium bg-primary/8" : "text-gray-500 hover:bg-gray-50"
                                                }`}
                                        >
                                            {child.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* Dynamic attribute filters */}
            {allAttributes.map((attr) => {
                const k = attr.name.toLowerCase();
                const sKey = `attr_${k}`;
                const selectedVals = k === "color" ? selectedColors : k === "size" ? selectedSizes : (selectedAttributes[k] || []);
                return (
                    <FilterSection
                        key={attr.id}
                        title={attr.name}
                        isOpen={!!openSections[sKey]}
                        onToggle={() => setOpenSections((p) => ({ ...p, [sKey]: !p[sKey] }))}
                    >
                        <div className="space-y-0.5 max-h-52 overflow-y-auto">
                            {attr.values.map((val) => {
                                const active = selectedVals.includes(val.id);
                                return (
                                    <button
                                        key={val.id}
                                        onClick={() => handleAttrChange(attr.name, val.id)}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${active ? "bg-primary/8 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${active ? "bg-primary border-primary" : "border-gray-300"
                                            }`}>
                                            {active && <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}><path d="M2 6l3 3 5-5" /></svg>}
                                        </span>
                                        {/* Color swatch */}
                                        {val.hexCode && (
                                            <span className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0" style={{ background: val.hexCode }} />
                                        )}
                                        {val.image && (
                                            <span className="w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0">
                                                <Image src={val.image} alt={val.name} width={14} height={14} />
                                            </span>
                                        )}
                                        {val.display || val.name}
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>
                );
            })}
        </div>
    );

    /* ── Loading initial ── */
    if (loading && products.length === 0 && !error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading products...</p>
            </div>
        );
    }

    /* ── Render ── */
    return (
        <div id="products-main">
            {/* Categories Carousel — desktop */}
            <div className="hidden lg:block mb-4">
                <CategoriesCarousel />
            </div>

            {/* Hero Banner */}
            <div className="relative w-full h-[160px] sm:h-[220px] md:h-[260px] mb-6 rounded-2xl overflow-hidden">
                <Image src="/banner-background.jpg" alt="Premium Dairy Products" fill className="object-cover object-top" priority />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/50 to-transparent flex items-center">
                    <div className="px-6 md:px-10 max-w-xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/25 border border-primary/30 text-primary text-[11px] font-semibold mb-3">
                            <Zap className="w-3 h-3" />
                            Farm Fresh
                        </span>
                        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-1.5">Premium Dairy Products</h1>
                        <p className="text-sm text-white/60 leading-relaxed hidden sm:block">
                            Pure Milk, Organic Ghee, Artisanal Butter & Fresh Paneer sourced directly from farms.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Top bar: mobile filter toggle + sort ── */}
            <div className="flex items-center gap-3 mb-5">
                {/* Mobile filter button */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors flex-shrink-0"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Result count */}
                <p className="text-sm text-gray-500 flex-1">
                    {loading
                        ? <span className="inline-block h-3.5 w-24 bg-gray-100 rounded animate-pulse" />
                        : <><span className="font-semibold text-gray-900">{pagination.total || 0}</span> products</>
                    }
                </p>

                {/* Sort */}
                <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white flex-shrink-0">
                    <span className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                        Sort
                    </span>
                    <select
                        value={currentSort()}
                        onChange={handleSortChange}
                        disabled={loading}
                        className="px-3 py-2 text-xs text-gray-700 focus:outline-none bg-white cursor-pointer"
                    >
                        <option value="newest">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>
            </div>

            {/* ── Active filter chips ── */}
            {activeCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {filters.search && (
                        <FilterChip label={`"${filters.search}"`} onRemove={() => handleFilterChange("search", "")} />
                    )}
                    {filters.category && (
                        <FilterChip
                            label={categories.find((c) => c.slug === filters.category)?.name || filters.category}
                            onRemove={() => handleFilterChange("category", "")}
                        />
                    )}
                    {selectedColors.map((cId) => (
                        <FilterChip key={cId}
                            label={colors.find((c) => c.id === cId)?.name || "Color"}
                            onRemove={() => { setSelectedColors([]); handleFilterChange("color", ""); }}
                        />
                    ))}
                    {selectedSizes.map((sId) => (
                        <FilterChip key={sId}
                            label={sizes.find((s) => s.id === sId)?.display || sizes.find((s) => s.id === sId)?.name || "Size"}
                            onRemove={() => { setSelectedSizes([]); handleFilterChange("size", ""); }}
                        />
                    ))}
                    {(filters.minPrice || filters.maxPrice) && (
                        <FilterChip
                            label={`₹${filters.minPrice || "0"} – ₹${filters.maxPrice || "∞"}`}
                            onRemove={() => { handleFilterChange("minPrice", ""); handleFilterChange("maxPrice", ""); }}
                        />
                    )}
                    <button onClick={clearFilters} className="text-[11px] text-gray-400 hover:text-primary transition-colors">
                        Clear all
                    </button>
                </div>
            )}

            {/* ── Layout: sidebar + grid ── */}
            <div className="flex gap-6">

                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <SidebarContent />
                    </div>
                </aside>

                {/* Product grid */}
                <div className="flex-1 min-w-0">
                    {loading && products.length === 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                            {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <EmptyState
                            filters={filters}
                            selectedColors={selectedColors}
                            selectedSizes={selectedSizes}
                            onClear={clearFilters}
                            onClearColors={() => { setSelectedColors([]); handleFilterChange("color", ""); }}
                            onClearSizes={() => { setSelectedSizes([]); handleFilterChange("size", ""); }}
                        />
                    ) : (
                        <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <Pagination
                            current={pagination.page}
                            total={pagination.pages}
                            loading={loading}
                            onChange={handlePageChange}
                        />
                    )}
                </div>
            </div>

            {/* ── Mobile Drawer ── */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-gray-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100">
                            <span className="font-bold text-gray-900">Filters</span>
                            <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            <SidebarContent />
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-white">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
                            >
                                Show {pagination.total || 0} results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
function EmptyState({ filters, selectedColors, selectedSizes, onClear, onClearColors, onClearSizes }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
                {selectedColors.length > 0 && selectedSizes.length > 0
                    ? "No products match this color and size combination."
                    : selectedColors.length > 0 ? "No products with this color."
                        : selectedSizes.length > 0 ? "No products with this size."
                            : filters.minPrice || filters.maxPrice ? "No products in this price range."
                                : "Try adjusting your filters or search term."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                <button onClick={onClear} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                    Clear all filters
                </button>
                {selectedColors.length > 0 && (
                    <button onClick={onClearColors} className="px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                        Clear color
                    </button>
                )}
                {selectedSizes.length > 0 && (
                    <button onClick={onClearSizes} className="px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                        Clear size
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────── */
function Pagination({ current, total, loading, onChange }) {
    const pages = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1))
            pages.push(i);
        else if ((i === 2 && current > 3) || (i === total - 1 && current < total - 2))
            pages.push("...");
    }
    // Deduplicate consecutive "..."
    const deduped = pages.filter((p, i, arr) => p !== "..." || arr[i - 1] !== "...");

    return (
        <div className="flex justify-center items-center gap-1.5 mt-10 mb-2">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1 || loading}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {deduped.map((p, i) =>
                p === "..." ? (
                    <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">
                        ···
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        disabled={loading}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${p === current
                            ? "bg-primary text-white shadow-sm"
                            : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total || loading}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────
   PAGE WRAPPER
───────────────────────────────────────────── */
const FALLBACK = (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
    </div>
);

export default function ProductsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-5 pb-24 md:pb-8">
                <ClientOnly fallback={FALLBACK}>
                    <Suspense fallback={FALLBACK}>
                        <ProductsContent />
                    </Suspense>
                </ClientOnly>
            </div>
        </div>
    );
}