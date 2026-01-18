import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";

async function getProducts() {
  await connectDB();
  const products = await Product.find({}).sort({ name: 1 }).lean();
  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wide mb-4">
                Exclusive Collection
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mores Curated Products</h1>
            <p className="text-gray-600">
                Enhance your beauty routine with our selection of premium haircare and skincare products from generated brands.
            </p>
        </div>

        {products.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
             <p className="text-gray-500">Products currently unavailable.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product._id.toString()}
                id={product._id.toString()}
                name={product.name}
                image={product.image}
                price={product.price}
                brand={product.brand}
                description={product.description}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
