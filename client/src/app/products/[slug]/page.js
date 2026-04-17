import { fetchApi } from "@/lib/utils";
import ProductContent from "./ProductContent";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export async function generateMetadata({ params }) {
    const { slug } = params;
    let title = "Product Details | Blue Bell FNB";
    let description =
        "Premium dairy products, sourced from fresh farms and delivered to your doorstep. Pure. Fresh. Local. Leading dairy provider trusted by thousands of happy families.";
    let image = null;

    try {
        // Fetch product details from API
        const response = await fetchApi(`/public/products/${slug}`);
        const product = response.data.product;

        if (product) {
            title = product.metaTitle || `${product.name} | Blue Bell FNB`;
            description =
                product.metaDescription || product.description || description;

            // Get the first image from product images
            if (product.images && product.images.length > 0) {
                image = getImageUrl(product.images[0].url);
            }
        }
    } catch (error) {
        console.error("Error fetching product metadata:", error);
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [image] : [],
            type: "website",
        },
    };
}

export default function ProductDetailPage({ params }) {
    return <ProductContent slug={params.slug} />;
}
