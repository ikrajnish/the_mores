import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import connectDB from "@/lib/db";
import ServiceCategory from "@/models/ServiceCategory";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

async function getCategories() {
  await connectDB();
  const categories = await ServiceCategory.find({}).lean();
  return categories;
}

export default async function ServicesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-gray-600">
            Explore our comprehensive range of beauty and wellness treatments designed to help you look and feel your best.
          </p>
        </div>

        {categories.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
             <p className="text-gray-500">No service categories available at the moment.</p>
           </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: any) => (
              <Link 
                key={category._id.toString()} 
                href={`/services/${category.name}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Placeholder for Category Image if we had one, for now utilizing pattern or just text card */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {/* You could add a map of category names to Unsplash images here specifically if you want rich UI */}
                      <span className="text-4xl font-light text-gray-300">{category.name[0]}</span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                       <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                         {category.name}
                       </h2>
                       <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      View all {category.name.toLowerCase()} services
                    </p>
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
