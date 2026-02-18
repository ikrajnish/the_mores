
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Crown } from "lucide-react";
import { Metadata } from "next";

import connectDB from "@/lib/db";
import Service, { IService } from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import User from "@/models/User";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { IServiceCategory } from "@/models/ServiceCategory";

// Define a type for the populated service to fix TS errors
interface PopulatedService extends Omit<IService, 'categoryId'> {
  categoryId: IServiceCategory | null;
}

const MEMBERSHIP_NORMAL = "NORMAL";

async function getServiceDetails(id: string) {
  await connectDB();
  const session = await auth();
  
  try {
    const service = await Service.findById(id).populate('categoryId').lean() as unknown as PopulatedService;
    if (!service) return null;

    // Parallelize independent fetches for performance
    const [normalMembership, userDoc] = await Promise.all([
        Membership.findOne({ name: MEMBERSHIP_NORMAL }).lean(),
        session?.user?.email ? User.findOne({ phone: session.user.email }).lean() : Promise.resolve(null)
    ]);

    // 1. Determine User Membership
    let userMembershipId = null;
    let membershipName = MEMBERSHIP_NORMAL;

    if (userDoc?.membershipId) {
        const expiryDate = userDoc.membershipExpiresAt ? new Date(userDoc.membershipExpiresAt) : null;
        const isExpired = expiryDate ? expiryDate < new Date() : false;

        if (!isExpired) {
            userMembershipId = userDoc.membershipId;
            const mem = await Membership.findById(userMembershipId).select('name').lean();
            if (mem) membershipName = mem.name;
        }
    }

    // 2. Fetch Prices (Parallelized)
    const pricePromises: Promise<any>[] = [
        normalMembership ? ServicePricing.findOne({ serviceId: service._id, membershipId: normalMembership._id }).lean() : Promise.resolve(null)
    ];

    if (userMembershipId && membershipName !== MEMBERSHIP_NORMAL) {
        pricePromises.push(ServicePricing.findOne({ serviceId: service._id, membershipId: userMembershipId }).lean());
    }

    const [normalPriceDoc, memberPriceDoc] = await Promise.all(pricePromises);

    const normalPrice = normalPriceDoc?.price || 0;
    
    // Logic: Use member price only if it exists and is explicitly set by admin (> 0)
    let memberPrice = null;
    if (memberPriceDoc && memberPriceDoc.price > 0) {
        memberPrice = memberPriceDoc.price;
    }

    return {
      service: {
        ...service,
        _id: service._id.toString(),
        categoryId: service.categoryId ? {
          ...service.categoryId,
          _id: service.categoryId._id.toString()
        } : null,
      },
      normalPrice,
      memberPrice,
      membershipName
    };
  } catch (error) {
    console.error(`Error fetching service details for ID ${id}:`, error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

// SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  await connectDB();
  const service = await Service.findById(id).select('name shortDescription').lean();
  
  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.name} | The Mores`,
    description: service.shortDescription || `Book ${service.name} at The Mores.`,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { category, id } = await params;
  const data = await getServiceDetails(id);

  if (!data) {
    notFound();
  }

  const { service, normalPrice, memberPrice, membershipName } = data;
  const showMemberSavings = memberPrice !== null && memberPrice < normalPrice;
  const categoryName = service.categoryId?.name || decodeURIComponent(category);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Back Navigation */}
          <Link 
            href={`/services?category=${encodeURIComponent(categoryName)}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-400 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {categoryName} Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image Section */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square lg:aspect-[4/3] shadow-lg border border-slate-700">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw" // Optimized for LCP
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No Image Available
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wide">
                    {categoryName}
                  </span>
                  {showMemberSavings && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wide animate-pulse">
                        <Crown className="w-3 h-3" />
                        {membershipName} Benefit
                      </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-50 leading-tight">
                  {service.name}
                </h1>
              </div>

              <div className="flex items-center gap-6 border-y border-slate-800 py-6">
                <div className="flex items-center text-slate-400">
                  <Clock className="w-5 h-5 mr-2 text-slate-500" />
                  <span className="font-medium">{service.duration} mins</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Description</h3>
                <p className="text-slate-400 leading-relaxed">
                  {service.shortDescription || "No description provided for this service."}
                </p>
              </div>

              <div className="pt-6 mt-auto">
                <Link href={`/book?serviceId=${service._id}`}>
                  <Button size="lg" className="w-full text-lg h-14 bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-slate-500">
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
