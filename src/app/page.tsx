import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/db";
import ServiceCategory from "@/models/ServiceCategory";
import Gallery from "@/models/Gallery";
import Product from "@/models/Product";
import Membership from "@/models/Membership";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { ServicesSection } from "@/components/home/ServicesSection";
import { BridalSection } from "@/components/home/BridalSection";
import { GallerySection } from "@/components/home/GallerySection";
import { HeroSection } from "@/components/home/HeroSection";

// Server Component Data Fetching
async function getHomeData() {
  await dbConnect();
  const [categories, gallery, products, memberships] = await Promise.all([
    ServiceCategory.find({ name: { $not: /Bridal Packages/i } }).lean(),
    Gallery.find({}).sort({ createdAt: -1 }).limit(7).lean(),
    Product.find({}).limit(3).lean(),
    Membership.find({}).lean(), // Just to ensuring connection, mostly static
  ]);
  return { categories, gallery, products, memberships };
}

import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: "Mores Salon | Best Luxury Salon for Hair, Skin & Wellness",
  description: "Visit Mores Salon for premium hair styling, skincare, and wellness treatments. Book your appointment today for a luxury beauty experience.",
  alternates: {
    canonical: '/',
  },
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { categories: rawCategories, gallery: rawGallery, products } = await getHomeData();
  
  const categories = rawCategories.map((cat: any) => ({
    ...cat,
    _id: cat._id.toString(),
  }));

  const gallery = rawGallery.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Mores Salon',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
    description: 'Experience the pinnacle of luxury hair, skin, and wellness treatments at Mores Salon.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mores the beauty destination, Near Gokul Restaurant, Kanke Road',
      addressLocality: 'Ranchi',
      addressRegion: 'Jharkhand',
      postalCode: '834006',
      addressCountry: 'IN',
    },
    priceRange: '$$',
    openingHoursSpecification: [
        {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ],
        "opens": "10:00",
        "closes": "21:00"
        }
    ],
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://themores.com',
    telephone: '+91-8102603450', // Updated Phone
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={jsonLd} />
      <Navbar />

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <HeroSection />

        {/* SERVICES PREVIEW */}
        {/* SERVICES PREVIEW */}
        <ServicesSection categories={categories} />
        <BridalSection/>

        {/* GALLERY PREVIEW */}
        {gallery.length > 0 && <GallerySection gallery={gallery} />}

        {/* MEMBERSHIP PREVIEW */}
        <section className="py-20 container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent inline-block">Unlock Exclusive Benefits</h2>
            <p className="text-slate-500">Join Mores Membership for special pricing and priority booking.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* SILVER */}
             <Link href="/memberships" className="block relative rounded-2xl p-8 border border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:border-slate-400 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 shadow-lg group-hover:scale-110 transition-transform duration-300 border border-slate-600">
                  <Star className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100">Silver Membership</h3>
                <p className="text-slate-300 mb-6 font-medium">Valid for 1 Year</p>
                <p className="text-slate-400 mb-8 border-b border-slate-800 pb-8">Perfect for establishing your premium routine.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm gap-3 text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Special Member Only Pricing</div>
                  <div className="flex items-center text-sm gap-3 text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Priority Booking Access</div>
                  <div className="flex items-center text-sm gap-3 text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Seasonal Offers</div>
                  <div className="flex items-center text-sm gap-3 text-slate-300 opacity-0"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Spacer</div> 
                </div>
                <Button variant="outline" className="w-full pointer-events-none border-slate-600 text-slate-300 hover:bg-slate-800 uppercase tracking-widest text-xs h-12">Become a Silver Member</Button>
             </Link>

             {/* GOLD */}
             <Link href="/memberships" className="block relative rounded-2xl p-8 border border-amber-500/30 bg-slate-900/80 backdrop-blur-md hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider shadow-lg">Most Popular</div>
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Gold Membership</h3>
                <p className="text-amber-500/80 mb-6 font-medium">Valid for 1 Year</p>
                <p className="text-slate-400 mb-8 border-b border-amber-500/20 pb-8">The ultimate enterprise-level luxury experience.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm gap-3 text-slate-200"><Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0"/> Exclusive Tier 1 Pricing</div>
                  <div className="flex items-center text-sm gap-3 text-slate-200"><Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0"/> Complimentary Premium Add-ons</div>
                  <div className="flex items-center text-sm gap-3 text-slate-200"><Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0"/> Dedicated Concierge Support</div>
                  <div className="flex items-center text-sm gap-3 text-slate-200"><Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0"/> VIP Event Access</div>
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold hover:from-amber-400 hover:to-amber-500 border-0 pointer-events-none uppercase tracking-widest text-xs h-12 shadow-lg shadow-amber-500/20">Become a Gold Member</Button>
             </Link>
          </div>
        </section>

         {/* PRODUCTS PREVIEW */}
        <section className="py-20">
           <div className="container mx-auto px-4">
               {/* Header Aligned like Gallery (Centered) */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent inline-block">Premium Products</h2>
                <p className="text-slate-500">Curated collection for your beauty routine.</p>
              </div>
              
              {products.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {products.map((prod: any) => (
                     <Link key={prod._id.toString()} href="/products" className="group block">
                       <div className="bg-slate-800 p-4 rounded-xl hover:shadow-lg transition-all border border-slate-700 hover:border-purple-500/30 h-full">
                         <div className="aspect-square bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                             {prod.image ? (
                                 <Image 
                                    src={prod.image} 
                                    alt={prod.name} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 33vw" 
                                 />
                             ) : (
                                 <span className="text-slate-400 text-xs">No Image</span>
                             )}
                         </div>
                         <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{prod.name}</h3>
                         <p className="text-amber-400 font-medium mt-1">₹{prod.price}</p>
                       </div>
                     </Link>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400">No products available yet.</p>
                </div>
              )}

               {/* Bottom Button Aligned like Gallery */}
               <div className="text-center mt-12">
                 <Link href="/products">
                    <Button variant="outline" className="border-slate-700 text-white bg-slate-400 hover:bg-slate-800">Shop All Products</Button>
                 </Link>
               </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

function UserIconPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
}
