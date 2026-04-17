import { Truck, Package, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";

export const metadata = {
    title: "Shipping Policy | Blue Bell FNB",
    description: "Learn about our shipping policy, delivery times, and shipping charges.",
};

const shippingInfo = [
    {
        icon: Truck,
        title: "Free Shipping",
        description: "Free delivery across India on orders above ₹999. For orders below ₹999, a flat shipping charge of ₹99 applies."
    },
    {
        icon: Clock,
        title: "Delivery Time",
        description: "Fresh dairy orders are typically delivered within 24-48 hours for metro cities and 3-5 business days for other locations."
    },
    {
        icon: Package,
        title: "Order Processing",
        description: "All orders are processed and dispatched within 24 hours to ensure maximum freshness. Tracking provided instantly."
    },
    {
        icon: MapPin,
        title: "Shipping Locations",
        description: "We ship farm-fresh dairy across India. Local delivery experts handle the final mile to maintain cold chain integrity."
    }
];

export default function ShippingPolicyPage() {
    return (
        <div className="bg-page min-h-screen">
            <PageHero
                title="Shipping Policy"
                description="Everything you need to know about our shipping and delivery"
                breadcrumbs={[{ label: "Shipping Policy" }]}
                variant="default"
                size="sm"
            />

            <section className="bg-section-white section-padding">
                <div className="section-container max-w-4xl">
                    {/* Overview */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {shippingInfo.map((info, index) => (
                            <div key={index} className="bg-muted/30 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <info.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-display font-bold text-lg mb-2">{info.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{info.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Policy */}
                    <div className="prose prose-lg max-w-none">
                        <h2 className="font-display text-2xl font-bold mb-4">Shipping Charges</h2>
                        <ul className="space-y-2 mb-8">
                            <li>Orders above ₹999: <strong>Free Shipping</strong></li>
                            <li>Orders below ₹999: <strong>₹99 flat shipping charge</strong></li>
                            <li>Bulk/Subscription orders: Contact us for special corporate rates</li>
                        </ul>

                        <h2 className="font-display text-2xl font-bold mb-4">Delivery Timeline</h2>
                        <p className="mb-4">Our dairy-fresh delivery schedules to ensure peak quality:</p>
                        <ul className="space-y-2 mb-8">
                            <li><strong>Metro Cities:</strong> 1-2 business days</li>
                            <li><strong>Tier 2 Cities:</strong> 3-5 business days</li>
                            <li><strong>Remote Areas:</strong> 5-7 business days (Limited availability)</li>
                        </ul>

                        <h2 className="font-display text-2xl font-bold mb-4">Order Tracking</h2>
                        <p className="mb-8">
                            Once your order is shipped, you will receive a tracking number via email and SMS.
                            You can track your order status using this tracking number on our courier partner&apos;s website.
                        </p>

                        <h2 className="font-display text-2xl font-bold mb-4">Packaging & Freshness</h2>
                        <p className="mb-8">
                            All products are shipped in <strong>temperature-controlled, insulated packaging</strong> with eco-friendly ice packs to maintain cold chain integrity from our farm to your fridge.
                        </p>

                        <h2 className="font-display text-2xl font-bold mb-4">Damaged/Lost Shipments</h2>
                        <p className="mb-4">
                            In the rare event that your order arrives damaged or goes missing during transit:
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li>Contact us within 48 hours of delivery with photos of the damage</li>
                            <li>We will arrange for a replacement or full refund</li>
                            <li>For lost shipments, we will initiate a full refund or send a replacement</li>
                        </ul>

                        <h2 className="font-display text-2xl font-bold mb-4">International Orders</h2>
                        <p className="mb-8">
                            Currently, we focus on domestic delivery across India to maintain quality standards. For high-volume export inquiries, please contact our export desk at <strong>bluebellfnb@gmail.com</strong>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
