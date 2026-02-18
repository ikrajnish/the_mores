"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ServiceCard from "@/components/ServiceCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// ... (Interfaces remain the same if not imported, but they are exported so I can leave them or re-declare if I was rewriting whole file, but I am doing partial edit. Wait, I should include imports.)

// Data Interfaces
export interface ServiceData {
  _id: string;
  name: string;
  image?: string;
  duration: number;
  price: number;
  shortDescription?: string;
  prices: Record<string, number>;
  categoryId: string;
}

export interface SubcategoryData {
  _id: string; // 'general' for uncategorized
  name: string;
  services: ServiceData[];
}

export interface CategoryData {
  _id: string;
  name: string;
  image?: string;
  subcategories: SubcategoryData[];
}

interface ServicesExplorerProps {
  categories: CategoryData[];
}

export default function ServicesExplorer({ categories }: ServicesExplorerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategoryName = searchParams.get("category");

  // Find category by name if param exists, otherwise default to first
  const initialCategory = initialCategoryName 
    ? categories.find(c => c.name.toLowerCase() === initialCategoryName.toLowerCase()) 
    : categories[0];

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialCategory ? initialCategory._id : (categories.length > 0 ? categories[0]._id : "")
  );
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = categories.find(c => c._id === activeCategoryId);

  // Update URL when category changes
  const handleCategoryChange = (catId: string) => {
      setActiveCategoryId(catId);
      const cat = categories.find(c => c._id === catId);
      if (cat) {
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.set("category", cat.name);
          router.replace(`?${newParams.toString()}`, { scroll: false });
      }
  };

  // Filter logic
  const filteredCategories = categories.map(cat => {
    // If not searching, return specific category content only if it's active layout logic
    // But for search, we might want to search across all.
    // Let's keep it simple: Select Category -> Show content. Search filters within active category? 
    // Or Global Search? 
    // User requested "clicking any services we are going to this page remove the navigation hierarchy".
    // I will look at the request: "on clicking (a category from the list) the contents should show on the same page"
    
    // So the primary interaction is category selection.
    
    return cat;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Sidebar / Top Nav for Categories */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="lg:sticky lg:top-24 space-y-6">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
             <Input 
               placeholder="Search services..." 
               className="pl-9 bg-slate-900 border-slate-800 focus-visible:ring-amber-500"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>

           {/* Mobile: Horizontal Scroll */}
           {/* Desktop: Vertical List */}
           <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x">
             {categories.map((cat) => (
               <button
                 key={cat._id}
                 onClick={() => handleCategoryChange(cat._id)}
                 className={cn(
                   "flex items-center gap-3 p-3 rounded-xl transition-all min-w-[160px] lg:w-full snap-start text-left border",
                   activeCategoryId === cat._id 
                     ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-lg shadow-amber-500/10" 
                     : "bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200"
                 )}
               >
                 {cat.image ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden relative shrink-0 bg-slate-700">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                    </div>
                 ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold">{cat.name.substring(0,2).toUpperCase()}</span>
                    </div>
                 )}
                 <span className="truncate">{cat.name}</span>
               </button>
             ))}
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow space-y-8">
        {/* If searching, show global results? Or just filter active view? 
            Let's keep it simple: Search filters active view, or if we want to be fancy, global. 
            For now, let's just show active category content. 
        */}
        
        {activeCategory ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-slate-50">{activeCategory.name}</h2>
                    <p className="text-slate-400 mt-1">
                        Displaying all services in {activeCategory.name}
                    </p>
                </div>

                <div className="space-y-12">
                    {activeCategory.subcategories.map((subcat) => {
                        // Filter services if there is a search query
                        const filteredServices = subcat.services.filter(s => 
                            s.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (filteredServices.length === 0) return null;

                        return (
                            <section key={subcat._id} className="space-y-6">
                                <h3 className="text-xl font-semibold text-amber-500 border-b border-slate-800 pb-2">
                                    {subcat.name}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredServices.map(service => (
                                        <ServiceCard
                                            key={service._id}
                                            id={service._id}
                                            name={service.name}
                                            image={service.image}
                                            price={service.price}
                                            duration={service.duration}
                                            shortDescription={service.shortDescription}
                                            categoryName={activeCategory.name}
                                            prices={service.prices}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
                
                {activeCategory.subcategories.every(s => s.services.filter(srv => srv.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0) && (
                     <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                        <p className="text-slate-500">No services found matching "{searchQuery}" in this category.</p>
                     </div>
                )}
            </div>
        ) : (
             <div className="text-center py-20">
                <p className="text-slate-500">Select a category to view services.</p>
             </div>
        )}
      </div>
    </div>
  );
}
