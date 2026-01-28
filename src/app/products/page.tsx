import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductSearch } from "@/components/ProductSearch";

async function getProducts(query?: string) {
  await connectDB();
  const filter = query 
    ? { name: { $regex: query, $options: 'i' } } 
    : {};
  
  const products = await Product.find(filter).sort({ name: 1 }).lean();
  return products;
}

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const products = await getProducts(query);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold uppercase tracking-wide mb-4">
                Exclusive Collection
            </span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4 inline-block">Mores Curated Products</h1>
            <p className="text-slate-400">
                Enhance your beauty routine with our selection of premium haircare and skincare products from generated brands.
            </p>
        </div>

        <ProductSearch />

        {products.length === 0 ? (
           <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
             <p className="text-slate-500">
                {query ? `No products found matching "${query}"` : "Products currently unavailable."}
             </p>
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
