import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Crown } from "lucide-react";

import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import ServiceCategory from "@/models/ServiceCategory"; // Required for populate
import Membership from "@/models/Membership";
import User from "@/models/User";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

async function getServiceDetails(id: string) {
  await connectDB();
  const session = await auth();
  
  try {
    const service = await Service.findById(id).populate('categoryId').lean();
    if (!service) return null;

    // 1. Identify User & Membership
    let userMembershipId = null;
    let membershipName = 'NORMAL';

    if (session?.user?.email) {
        const user = await User.findOne({ phone: session.user.email }).lean();
        if (user?.membershipId) {
            // Check for expiration
            let isExpired = false;
            if (user.membershipExpiresAt) {
                const expiryDate = new Date(user.membershipExpiresAt);
                if (expiryDate < new Date()) {
                    isExpired = true;
                }
            }

            if (!isExpired) {
                userMembershipId = user.membershipId;
                const mem = await Membership.findById(user.membershipId).lean();
                if (mem) membershipName = mem.name;
            }
        }
    }

    // 2. Fetch Prices
    const normalMembership = await Membership.findOne({ name: "NORMAL" }).lean();
    const normalPriceDoc = normalMembership ? await ServicePricing.findOne({ serviceId: service._id, membershipId: normalMembership._id }).lean() : null;
    const normalPrice = normalPriceDoc ? normalPriceDoc.price : 0;

    let memberPrice = null;
    if (userMembershipId && membershipName !== 'NORMAL') {
        const memberPriceDoc = await ServicePricing.findOne({ serviceId: service._id, membershipId: userMembershipId }).lean();
        // Fallback: Only use member price if it's explicitly set (> 0). If 0, it means admin didn't set it, so use normal price.
        if (memberPriceDoc && memberPriceDoc.price > 0) {
            memberPrice = memberPriceDoc.price;
        }
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
    console.error("Error fetching service:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function ServiceDetailPage(props: PageProps) {
  const { category, id } = await props.params;
  const data = await getServiceDetails(id);

  if (!data) {
    notFound();
  }

  const { service, normalPrice, memberPrice, membershipName } = data;
  const displayPrice = memberPrice !== null ? memberPrice : normalPrice;
  const showMemberSavings = memberPrice !== null && memberPrice < normalPrice;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb / Back Navigation */}
          <Link 
            href={`/services/${category}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-400 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {decodeURIComponent(category)} Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square lg:aspect-[4/3] shadow-lg border border-slate-700">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No Image Available
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wide">
                    {/* @ts-ignore */}
                    {service.categoryId?.name || category}
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
                <div className="flex flex-col">
                   {showMemberSavings && (
                       <span className="text-sm text-slate-500 line-through mb-1">₹{normalPrice}</span>
                   )}
                   <div className="flex items-center gap-2">
                       <span className={`text-3xl font-bold ${showMemberSavings ? 'text-amber-500' : 'text-purple-400'}`}>
                           ₹{displayPrice}
                       </span>
                       {showMemberSavings && (
                           <span className="text-xs font-medium text-green-500 px-2 py-0.5 rounded bg-green-500/10">
                               Save ₹{normalPrice - memberPrice}
                           </span>
                       )}
                   </div>
                </div>
                <div className="h-12 w-px bg-slate-800"></div>
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
