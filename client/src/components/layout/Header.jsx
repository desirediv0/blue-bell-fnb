"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";

// React Icons
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiSearch,
  FiHeart, FiChevronDown, FiChevronRight, FiZap,
  FiPackage, FiLogOut, FiMapPin, FiMail, FiPhone,
} from "react-icons/fi";

// Lucide Icons
import { User, Package, MapPin, Heart, LogOut, Zap } from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const CONTACT = {
  email: "admin@bluebellservice.co.in",
  phone: "+91 7303249605",
};

const NAV_LINKS = [
  { href: "/products",   label: "All Products" },
  { href: "/about",      label: "About Us"     },
  { href: "/contact",    label: "Contact"      },
];

const FOOTER_LINKS = [
  { href: "/about",           label: "About Us"        },
  { href: "/contact",         label: "Contact"         },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

/* ─────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────── */
function NavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-[15px] text-gray-800 hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, label, onClick, badge }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors"
    >
      <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
      <span>{label}</span>
      {badge > 0 && (
        <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

function AvatarCircle({ name, size = "sm" }) {
  const dim = size === "lg" ? "w-12 h-12 text-lg" : "w-8 h-8 text-sm";
  return (
    <div className={`${dim} bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────────── */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount }              = useCart();
  const router                            = useRouter();
  const pathname                          = usePathname();

  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [categories,     setCategories]     = useState([]);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [isSearchOpen,   setIsSearchOpen]   = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled,     setIsScrolled]     = useState(false);

  const searchInputRef = useRef(null);
  const navbarRef      = useRef(null);

  // ── Side effects ────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target))
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isSearchOpen]);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(console.error);
  }, []);

  // ── Handlers ────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const cartCount = getCartItemCount();

  // ── Render ───────────────────────────────────
  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "shadow-lg bg-white/98 backdrop-blur-md" : "bg-white",
        )}
      >
        <Toaster position="top-center" richColors />

        {/* ── Top Bar ── */}
        <div className="bg-gradient-to-r from-primary to-[#165a95] text-white text-[11px] md:text-[13px]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-10">

              {/* Left: Email + Phone */}
              <div className="flex items-center gap-3">
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-1 hover:text-white/80 transition-colors">
                  <FiMail className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{CONTACT.email}</span>
                </a>
                <a href={`tel:${CONTACT.phone}`} className="hidden md:flex items-center gap-1 hover:text-white/80 transition-colors">
                  <FiPhone className="h-3.5 w-3.5" />
                  {CONTACT.phone}
                </a>
              </div>

              {/* Center: Promo */}
              <p className="hidden lg:block text-center flex-1 mx-4">
                Shop For ₹999+ And Receive A Scratch Card With Exciting Rewards!
              </p>

              {/* Right: Quick Links */}
              <div className="flex items-center gap-3">
                <Link href="/shipping-policy" className="hover:text-white/80 transition-colors">Shipping</Link>
                <Link href="/faqs"            className="hover:text-white/80 transition-colors">FAQs</Link>
                <Link href="/contact"         className="hover:text-white/80 transition-colors hidden sm:inline">Contact</Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Header ── */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-[72px]">

              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image src="/logo.png" alt="Logo" width={180} height={65} className="h-12 md:h-16 w-auto" priority />
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center justify-center gap-6 flex-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <NavLink key={href} href={href}>{label}</NavLink>
                ))}

                {/* Categories Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("categories")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-[15px] text-gray-800 hover:text-primary transition-colors">
                    Categories
                    <FiChevronDown className={cn("h-4 w-4 transition-transform", activeDropdown === "categories" && "rotate-180")} />
                  </button>

                  {activeDropdown === "categories" && (
                    <div className="absolute left-0 top-full pt-4 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                        {categories.slice(0, 8).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                          >
                            <FiZap className="h-4 w-4 text-primary/50 flex-shrink-0" />
                            {cat.name}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <Link href="/categories" className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors">
                            View All <FiChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-1">
                {/* Search */}
                <button onClick={() => setIsSearchOpen(true)} className="p-2.5 text-gray-700 hover:text-primary transition-colors" aria-label="Search">
                  <FiSearch className="h-[22px] w-[22px]" />
                </button>

                {/* Wishlist */}
                <Link href="/wishlist" className="p-2.5 text-gray-700 hover:text-primary transition-colors" aria-label="Wishlist">
                  <FiHeart className="h-[22px] w-[22px]" />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link href="/cart" className="p-2.5 text-gray-700 hover:text-primary transition-colors relative" aria-label="Cart">
                    <FiShoppingCart className="h-[22px] w-[22px]" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                {/* Account Dropdown */}
                <AccountDropdown
                  user={user}
                  isAuthenticated={isAuthenticated}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  handleLogout={handleLogout}
                />

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="lg:hidden p-2.5 text-gray-700 hover:text-primary transition-colors"
                  aria-label="Open menu"
                >
                  <FiMenu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search Dialog ── */}
      <SearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchInputRef={searchInputRef}
        categories={categories}
      />

      {/* ── Mobile Drawer ── */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        categories={categories}
        cartCount={cartCount}
        handleLogout={handleLogout}
        pathname={pathname}
      />

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav pathname={pathname} isAuthenticated={isAuthenticated} cartCount={cartCount} />
    </>
  );
}

/* ─────────────────────────────────────────────
   ACCOUNT DROPDOWN
───────────────────────────────────────────── */
function AccountDropdown({ user, isAuthenticated, activeDropdown, setActiveDropdown, handleLogout }) {
  const open = activeDropdown === "account";

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={() => setActiveDropdown("account")}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <ClientOnly>
        <button className={cn("flex items-center gap-1 p-2.5 transition-colors", open ? "text-primary" : "text-gray-700 hover:text-primary")}>
          {isAuthenticated ? (
            <AvatarCircle name={user?.name} />
          ) : (
            <>
              <FiUser className="h-[22px] w-[22px]" />
              <FiChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full pt-2 z-50">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-72 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              {isAuthenticated ? (
                <>
                  <div className="bg-gradient-to-br from-primary/5 to-blue-50 p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <AvatarCircle name={user?.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {[
                      { href: "/account",           icon: User,    label: "My Profile"  },
                      { href: "/account/orders",    icon: Package, label: "My Orders"   },
                      { href: "/account/addresses", icon: MapPin,  label: "Addresses"   },
                      { href: "/wishlist",          icon: Heart,   label: "Wishlist"    },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href} onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                        <Icon className="h-4 w-4 text-gray-400" /> {label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 py-2">
                    <button onClick={() => { handleLogout(); setActiveDropdown(null); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-5">
                  <div className="text-center mb-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Welcome!</h3>
                    <p className="text-sm text-gray-500 mt-1">Sign in to access your account</p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/auth" onClick={() => setActiveDropdown(null)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 h-11">Sign In</Button>
                    </Link>
                    <Link href="/auth?tab=register" onClick={() => setActiveDropdown(null)}>
                      <Button variant="outline" className="w-full h-11">Create Account</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEARCH DIALOG
───────────────────────────────────────────── */
function SearchDialog({ open, onOpenChange, searchQuery, setSearchQuery, handleSearch, searchInputRef, categories }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden border border-gray-200 shadow-xl rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiSearch className="h-5 w-5 text-primary" />
            </div>
            Find your favorites
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Input */}
          <form onSubmit={handleSearch} className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary transition" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-28 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition placeholder:text-gray-400"
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="p-1.5 text-gray-400 hover:text-gray-600">
                  <FiX className="h-4 w-4" />
                </button>
              )}
              <Button type="submit" className="h-9 px-4 bg-primary hover:bg-primary/90 text-white text-xs rounded-md">
                Search
              </Button>
            </div>
          </form>

          {/* Trending */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-wide">Trending Now</span>
              <Link href="/products" onClick={() => onOpenChange(false)} className="text-[11px] text-gray-600 hover:text-black uppercase tracking-wide">
                View All
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => onOpenChange(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white border border-gray-200 rounded-full text-xs transition">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 border border-gray-300 rounded bg-gray-100 text-gray-500">ESC</kbd>
              close
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 border border-gray-300 rounded bg-gray-100 text-gray-500">ENTER</kbd>
              search
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────
   MOBILE DRAWER
───────────────────────────────────────────── */
function MobileMenu({ isOpen, onClose, user, isAuthenticated, categories, cartCount, handleLogout, pathname }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <Image src="/logo.png" alt="Logo" width={100} height={35} className="h-8 w-auto" />
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* User Section */}
        <ClientOnly>
          <div className="p-4 bg-gradient-to-br from-primary/5 to-blue-50 border-b border-gray-100 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <AvatarCircle name={user?.name} size="lg" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth" className="flex-1" onClick={onClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
                </Link>
                <Link href="/auth?tab=register" className="flex-1" onClick={onClose}>
                  <Button variant="outline" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </ClientOnly>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3">

          {/* Main Links */}
          <div className="px-4 space-y-0.5">
            <MobileNavItem href="/products"   icon={FiZap}          label="All Products"  onClick={onClose} />
            <MobileNavItem href="/categories" icon={FiSearch}       label="Categories"    onClick={onClose} />
            <MobileNavItem href="/wishlist"   icon={FiHeart}        label="Wishlist"      onClick={onClose} />
            <MobileNavItem href="/cart"       icon={FiShoppingCart} label="Cart"          onClick={onClose} badge={cartCount} />
          </div>

          {/* Category shortcuts */}
          {categories.length > 0 && (
            <Section title="Categories">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">
                  <Zap className="h-4 w-4 text-primary/40 flex-shrink-0" /> {cat.name}
                </Link>
              ))}
            </Section>
          )}

          {/* Account Links (only when authenticated) */}
          <ClientOnly>
            {isAuthenticated && (
              <Section title="Account">
                {[
                  { href: "/account",           icon: FiUser,    label: "Profile"    },
                  { href: "/account/orders",    icon: FiPackage, label: "My Orders"  },
                  { href: "/account/addresses", icon: FiMapPin,  label: "Addresses"  },
                ].map(({ href, icon, label }) => (
                  <MobileNavItem key={href} href={href} icon={icon} label={label} onClick={onClose} />
                ))}
                <button onClick={() => { handleLogout(); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <FiLogOut className="h-4 w-4 flex-shrink-0" /> Sign Out
                </button>
              </Section>
            )}
          </ClientOnly>

          {/* Footer Links */}
          <Section title="More">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">
                {label}
              </Link>
            ))}
          </Section>

          {/* Contact info */}
          <div className="mx-4 mt-2 p-4 bg-gray-50 rounded-xl space-y-2">
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
              <FiMail className="h-4 w-4 flex-shrink-0" /> {CONTACT.email}
            </a>
            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
              <FiPhone className="h-4 w-4 flex-shrink-0" /> {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HELPER (mobile drawer)
───────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 px-4">
      <p className="px-4 text-[10px] text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────── */
function BottomNav({ pathname, isAuthenticated, cartCount }) {
  const items = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: pathname === "/",
    },
    {
      href: "/categories",
      label: "Categories",
      icon: <FiSearch className="h-5 w-5" />,
      active: pathname === "/categories",
    },
    {
      href: "/cart",
      label: "Cart",
      icon: (
        <div className="relative">
          <FiShoppingCart className="h-5 w-5" />
          <ClientOnly>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </ClientOnly>
        </div>
      ),
      active: pathname === "/cart",
    },
    {
      href: isAuthenticated ? "/account" : "/auth",
      label: "Account",
      icon: <FiUser className="h-5 w-5" />,
      active: pathname.startsWith("/account") || pathname === "/auth",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
      <div className="grid grid-cols-4">
        {items.map(({ href, label, icon, active }) => (
          <Link
            key={href}
            href={href}
            className={cn("flex flex-col items-center py-2.5 transition-colors", active ? "text-primary" : "text-gray-400 hover:text-gray-600")}
          >
            {icon}
            <span className="text-[10px] mt-0.5 font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;