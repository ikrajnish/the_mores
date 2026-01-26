import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Grid } from "lucide-react";

import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServiceCategory from "@/models/ServiceCategory";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import Subcategory from "@/models/Subcategory";

// Helper to fetch data
async function getCategoryAndSubcategories(categoryName: string) {
  await connectDB();

  const category = await ServiceCategory.findOne({ name: categoryName });
  if (!category) return null;

  // 1. Fetch defined subcategories for this category
  const definedSubcats = await Subcategory.find({ categoryId: category._id }).sort({ name: 1 }).lean();
  const subcategoryNames = definedSubcats.map(s => s.name);

  // 2. Check if there are any services with NO subcategory (to treat as 'General')
  // User Requested removal of "General" card.
  // const uncategorizedCount = await Service.countDocuments({ 
  //     categoryId: category._id, 
  //     $or: [{ subcategory: null }, { subcategory: { $exists: false } }] 
  // });

  const subcategories = definedSubcats.map(s => ({ name: s.name, image: s.image }));

  // if (uncategorizedCount > 0) {
  //     subcategories.unshift({ name: "General", image: "" }); // Add General at the beginning
  // }

  return { category, subcategories };
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage(props: PageProps) {
  const { category: categoryParam } = await props.params;
  const decodedCategory = decodeURIComponent(categoryParam);
  const data = await getCategoryAndSubcategories(decodedCategory);

  if (!data) {
    notFound();
  }

  const { category, subcategories } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/services" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-400 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl capitalize">
            {category.name}
          </h1>
          <p className="mt-2 text-slate-400">
            Select a category to view specific services.
          </p>
        </div>

        {subcategories.length === 0 ? (
          <div className="rounded-lg bg-slate-800 p-12 text-center border border-slate-700 shadow-sm">
            <h3 className="text-lg font-medium text-slate-50">No services found</h3>
            <p className="mt-2 text-slate-400">
              This category currently has no services available.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subcategories.map((sub) => (
              <Link
                key={sub.name}
                href={`/services/${categoryParam}/${encodeURIComponent(sub.name)}`}
                className="group block"
              >
                  <div className="relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 h-full min-h-[200px] flex flex-col">
                      {sub.image ? (
                           <div className="h-32 w-full relative bg-slate-700">
                               <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                      ) : (
                           <div className="h-32 w-full bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-slate-600 transition-colors">
                               <Grid className="h-10 w-10 opacity-50" />
                           </div>
                      )}
                      
                      <div className="p-4 flex flex-col items-center text-center flex-grow justify-center">
                          <h3 className="text-lg font-semibold text-slate-50 group-hover:text-purple-400 transition-colors">
                              {sub.name}
                          </h3>
                          <div className="mt-2 flex items-center text-xs font-medium text-slate-400 group-hover:text-purple-400 transition-colors">
                              View Services <ArrowRight className="ml-1 h-3 w-3" />
                          </div>
                      </div>
                  </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
