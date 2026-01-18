import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

async function getServiceDetails(id: string) {
  await connectDB();

  try {
    const service = await Service.findById(id).populate('categoryId').lean();
    if (!service) return null;

    // Fetch pricing for NORMAL membership
    const normalMembership = await Membership.findOne({ name: "NORMAL" });
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
      categoryId: service.categoryId ? {
        ...service.categoryId,
        _id: service.categoryId._id.toString()
      } : null,
      price,
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function ServiceDetailPage(props: PageProps) {
  const { category, id } = await props.params;
  const service = await getServiceDetails(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb / Back Navigation */}
          <Link 
            href={`/services/${category}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {decodeURIComponent(category)} Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square lg:aspect-[4/3] shadow-lg">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wide">
                    {(service.categoryId as any)?.name || category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {service.name}
                </h1>
              </div>

              <div className="flex items-center gap-6 border-y border-gray-100 py-6">
                <div className="flex items-center">
                   <span className="text-3xl font-bold text-amber-600">₹{service.price}</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-medium">{service.duration} mins</span>
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.shortDescription || "No description provided for this service."}
                </p>
                {/* 
                  Future: If we have a long 'description' field, we can render it here. 
                  Currently using 'shortDescription' as the main description.
                */}
              </div>

              <div className="pt-6 mt-auto">
                <Link href={`/book?serviceId=${service._id}`}>
                  <Button size="lg" className="w-full text-lg h-14 bg-gray-900 hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-gray-500">
                  Secure checkout • Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
