import "./globals.css";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Blue Bell FNB | Premium Dairy Products & Organic Farm Direct",
  description: "Premium dairy products from Blue Bell FNB. Pure milk, butter, cheese, and more delivered fresh from our farms. Trusted quality for your family.",
  keywords: "Blue Bell FNB, dairy products, fresh milk, organic butter, artisanal cheese, farm direct delivery, premium dairy India",
  authors: [{ name: "Blue Bell FNB" }],
  openGraph: {
    title: "Blue Bell FNB | Premium Dairy Products & Organic Farm Direct",
    description: "Premium dairy products from Blue Bell FNB. Pure milk, butter, cheese, and more delivered fresh from our farms.",
    type: "website",
    locale: "en_IN",
    siteName: "Blue Bell FNB",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
