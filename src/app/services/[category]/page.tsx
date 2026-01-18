import { notFound } from "next/navigation";
import Image from "next/image";
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
// Helper to fetch data
async function getCategoryAndServices(categoryName: string) {
  await connectDB();

  const category = await ServiceCategory.findOne({ name: categoryName });
  if (!category) return null;

  const services = await Service.find({ categoryId: category._id }).lean();

  // Fetch prices for 'NORMAL' membership for these services
  const normalMembership = await Membership.findOne({ name: "NORMAL" });
  
  const servicesWithPrices = await Promise.all(
    services.map(async (service) => {
      // Find pricing for this service and NORMAL membership
      // If no pricing found, default to 0 (or handle error)
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
  params: Promise<{ category: string }>;
}

export default async function ServiceListPage(props: PageProps) {
  const {category: categoryParam} = await props.params;
  const decodedCategory = decodeURIComponent(categoryParam);
  const data = await getCategoryAndServices(decodedCategory);

  if (!data) {
    notFound();
  }

  const { category, services } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl capitalize">
            {category.name} Services
          </h1>
          <p className="mt-2 text-gray-600">
            Choose from our wide range of professional {category.name.toLowerCase()} services.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center border border-gray-100 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">No services found</h3>
            <p className="mt-2 text-gray-500">
              Check back later for new services in this category.
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
