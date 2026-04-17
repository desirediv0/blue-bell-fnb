import { Factory, Users, Trophy, Target, CheckCircle, ArrowRight, Store, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
    title: "About Us | Blue Bell FNB - Premium Dairy Products",
    description: "Learn about Blue Bell FNB, India's leading source of pure, farm-fresh dairy products since 2009.",
};

const stats = [
    { value: "15+", label: "Years Experience", icon: <Trophy className="w-5 h-5" /> },
    { value: "50K+", label: "Happy Families", icon: <Users className="w-5 h-5" /> },
    { value: "100+", label: "Dairy Products", icon: <Store className="w-5 h-5" /> },
    { value: "Fresh", label: "Daily Delivery", icon: <Zap className="w-5 h-5" /> },
];

const values = [
    {
        icon: Factory,
        title: "Farm Direct",
        description: "We source all our milk directly from local certified farms, ensuring 100% purity and supporting our local farming community."
    },
    {
        icon: Target,
        title: "Purity Guarantee",
        description: "Every batch undergoes rigorous quality testing for fat content, toxins, and freshness before it reaches your home."
    },
    {
        icon: Users,
        title: "Family First",
        description: "For over 15 years, we've prioritized the health of your family by providing unadulterated dairy products."
    },
    {
        icon: Trophy,
        title: "Quality Leader",
        description: "Trusted by premium cafes, chefs, and health-conscious households across the nation."
    }
];

const features = [
    "Factory Direct Pricing",
    "Nationwide Shipping",
    "1 Year Warranty",
    "Expert Support",
    "Bulk Discounts",
    "COD Available"
];

const milestones = [
    { year: "2009", event: "Company Founded", description: "Started our journey with a single farm collective in India." },
    { year: "2014", event: "Organic Certification", description: "Achieved full organic certification for our entire supply chain." },
    { year: "2019", event: "Eco-Friendly Packing", description: "Transitioned to sustainable, temperature-controlled packaging." },
    { year: "2024", event: "50K+ Families", description: "Proudly serving over 50,000 happy households daily." }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-20 w-60 h-60 bg-blue-50 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
                            <Store className="w-4 h-4" />
                            Established 2009
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Pure Dairy, <span className="text-primary">Direct From Farms</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            For over 15 years, Blue Bell FNB has been committed to bringing the purest, farm-fresh dairy products directly to your doorstep, ensuring health and quality for every family.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {features.map((feature, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                                    <CheckCircle className="w-3.5 h-3.5 text-primary" /> {feature}
                                </span>
                            ))}
                        </div>
                        <Link href="/products">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-semibold gap-2">
                                Explore Products <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 border-y border-gray-100 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary">
                                    {stat.icon}
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                <p className="text-gray-500 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Our Values</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Blue Bell FNB?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We&apos;re committed to delivering the freshest dairy experience with zero adulteration.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                                    <value.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story & Timeline */}
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Our Story</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                15 Years of Dairy Passion
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                What started as a small farm collective in 2009 has grown into one of India&apos;s most trusted names for fresh dairy. Our journey has been driven by a passion for purity and the well-being of our customers.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Today, we serve over 50,000 families across the nation. From pure cow milk and buffalo ghee to artisanal butter and fresh panner, our products are a staple in health-conscious households.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <span className="font-medium">Quality Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Factory className="w-5 h-5 text-primary" />
                                    <span className="font-medium">Made in India</span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Our Journey</h3>
                            <div className="space-y-6">
                                {milestones.map((milestone, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {milestone.year.slice(-2)}
                                            </div>
                                            {index < milestones.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                                        </div>
                                        <div className="pb-6">
                                            <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                                            <h4 className="font-bold text-gray-900">{milestone.event}</h4>
                                            <p className="text-sm text-gray-500">{milestone.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-primary/5 border-t border-primary/10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Ready to Experience Farm Fresh Quality?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                        Join 50,000+ health-conscious families who trust Blue Bell FNB for their daily dairy needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/products">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-semibold">
                                Shop Now
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 h-12 rounded-xl font-semibold">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
