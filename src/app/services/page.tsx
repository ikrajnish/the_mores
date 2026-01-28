import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import connectDB from "@/lib/db";
import ServiceCategory from "@/models/ServiceCategory";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

async function getCategories() {
  await connectDB();
  const categories = await ServiceCategory.find({ name: { $not: /Bridal Packages/i } }).lean();
  return categories;
}

export default async function ServicesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent inline-block mb-4">Our Services</h1>
          <p className="text-slate-400">
            Explore our comprehensive range of beauty and wellness treatments designed to help you look and feel your best.
          </p>
        </div>

        {categories.length === 0 ? (
           <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
             <p className="text-slate-400">No service categories available at the moment.</p>
           </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: any) => (
              <Link 
                key={category._id.toString()} 
                href={`/services/${category.name}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
                  {/* Placeholder for Category Image if we had one, for now utilizing pattern or just text card */}
                  <div className="h-48 relative bg-slate-700 overflow-hidden">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <span className="text-4xl font-light text-slate-600">{category.name[0]}</span>
                      </div>
                    )}
                    {/* Gradient Overlay for better text visibility if needed, though text is below in this design. 
                        The home page design had text ON the image. This page has text BELOW. 
                        The user just said "images should also visible here". 
                        I will keep the image clean.
                    */}
                  </div>
                  
                   <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                       <h2 className="text-xl font-bold text-slate-50 transition-colors">
                         {category.name}
                       </h2>
                       <ArrowRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-slate-400 text-sm">
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
