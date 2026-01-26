import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServiceCategory from "@/models/ServiceCategory";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import ServiceCard from "@/components/ServiceCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import Subcategory from "@/models/Subcategory";

// Helper to fetch data
async function getSubcategoryServices(categoryName: string, subcategoryName: string) {
  await connectDB();

  const category = await ServiceCategory.findOne({ name: categoryName });
  if (!category) return null;

  let query: any = { categoryId: category._id };

  if (subcategoryName === "General") {
     query.$or = [
         { subcategory: { $exists: false } },
         { subcategory: null },
         { subcategory: "" }
     ];
  } else {
     // Find the subcategory Doc first
     const subDoc = await Subcategory.findOne({ 
         name: subcategoryName,
         categoryId: category._id 
     });

     if (!subDoc) return { category, services: [] }; // Return empty if subcat not found
     query.subcategory = subDoc._id;
  }

  const services = await Service.find(query).lean();

  // Fetch prices for 'NORMAL' membership
  const normalMembership = await Membership.findOne({ name: "NORMAL" });
  
  const servicesWithPrices = await Promise.all(
    services.map(async (service) => {
      let price = 0;
      if (normalMembership) {
        const pricing = await ServicePricing.findOne({
          serviceId: service._id,
          membershipId: normalMembership._id,
        });
        if (pricing) {
          price = pricing.price;
        }
      }

      return {
        ...service,
        _id: service._id.toString(),
        categoryId: service.categoryId.toString(),
        price,
      };
    })
  );

  return { category, services: servicesWithPrices };
}

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubcategoryPage(props: PageProps) {
  const { category: categoryParam, subcategory: subcategoryParam } = await props.params;
  const decodedCategory = decodeURIComponent(categoryParam);
  const decodedSubcategory = decodeURIComponent(subcategoryParam);

  const data = await getSubcategoryServices(decodedCategory, decodedSubcategory);

  if (!data) {
    notFound();
  }

  const { category, services } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href={`/services/${categoryParam}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-400 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {category.name}
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl capitalize">
            {decodedSubcategory} Services
          </h1>
          <p className="mt-2 text-slate-400">
            Professional {decodedSubcategory.toLowerCase()} services in {category.name}.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="rounded-lg p-12 text-center border border-slate-700 bg-slate-800 shadow-sm">
            <h3 className="text-lg font-medium text-slate-50">No services found</h3>
            <p className="mt-2 text-slate-400">
              Check back later for new services in this subcategory.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                id={service._id}
                name={service.name}
                image={service.image}
                price={service.price}
                duration={service.duration}
                shortDescription={service.shortDescription}
                categoryName={categoryParam}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
