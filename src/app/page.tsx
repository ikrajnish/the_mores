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

// Server Component Data Fetching
async function getHomeData() {
  await dbConnect();
  const [categories, gallery, products, memberships] = await Promise.all([
    ServiceCategory.find({}).lean(),
    Gallery.find({ type: 'image' }).sort({ createdAt: -1 }).limit(4).lean(),
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

export default async function Home() {
  const { categories, gallery, products } = await getHomeData();

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
        <section className="relative min-h-[85svh] flex items-center justify-center bg-slate-900 text-white overflow-hidden pb-16 pt-20 md:py-0">
          {/* Background Image Placeholder */}
          <Image 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2574&auto=format&fit=crop" 
            alt="Mores Salon Interior" 
            fill 
            className="object-cover opacity-40 z-0" 
            priority
          />
          <div className="absolute inset-0 bg-slate-900/40 z-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/20"></div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6 md:space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent leading-[1.1]">
              Elevate Your <br className="hidden md:block"/> Beauty
            </h1>
            <p className="text-lg md:text-2xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
              Experience the pinnacle of luxury hair, skin, and wellness treatments at Mores Salon.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 md:pt-8 w-full px-6 sm:px-0">
              <Link href="/services" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full bg-white text-slate-900 hover:bg-slate-200 h-14 px-8 text-lg font-semibold">
                  Book Appointment <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/memberships" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg bg-white/5 backdrop-blur-sm">
                  View Memberships
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICES PREVIEW */}
        <section className="py-16 md:py-24 container mx-auto px-4">
           {/* Header Aligned like Gallery (Centered) */}
           <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Our Services</h2>
              <p className="text-slate-500 text-lg">Expert care for every part of you.</p>
           </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat: any) => (
                <Link key={cat._id.toString()} href={`/services/${cat.name}`} className="group relative overflow-hidden rounded-2xl h-64 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:scale-[1.02]">
                  {cat.image && (
                      <Image 
                        src={cat.image} 
                        alt={cat.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                  )}
                  <div className={`absolute inset-0 p-6 flex flex-col justify-end transition-colors ${cat.image ? 'bg-gradient-to-t from-slate-900/90 to-transparent' : 'bg-white dark:bg-slate-900'}`}>
                    <h3 className={`text-xl font-bold mb-2 ${cat.image ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{cat.name}</h3>
                    <div className={`flex items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity ${cat.image ? 'text-slate-200' : 'text-slate-500'}`}>
                      Explore <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
               <p className="text-slate-500">No service categories found. Seed database to view.</p>
            </div>
          )}

           {/* Bottom Button Aligned like Gallery */}
           <div className="text-center mt-12">
             <Link href="/services">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">View All Services</Button>
             </Link>
           </div>
        </section>

        {/* GALLERY PREVIEW */}
        <section className="py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Mores Gallery</h2>
              <p className="text-slate-400">A glimpse into our world of style and sophistication.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Fetch from DB or use placeholders if empty */}
               {gallery.length > 0 ? gallery.map((item: any, i: number) => (
                 <div key={item._id.toString()} className={`aspect-square rounded-xl overflow-hidden bg-slate-800 relative ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                    {item.mediaUrl ? (
                         /* eslint-disable-next-line @next/next/no-img-element */
                      <Image 
                        src={item.mediaUrl} 
                        alt="Gallery" 
                        fill 
                        className="object-cover hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                    )}
                 </div>
               )) : (
                 <>
                   <div className="aspect-square md:col-span-2 md:row-span-2 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-500">Gallery Empty</div>
                   <div className="aspect-square rounded-xl bg-slate-800/50"></div>
                   <div className="aspect-square rounded-xl bg-slate-800/50"></div>
                 </>
               )}
            </div>
            <div className="text-center mt-12">
              <Link href="/gallery">
                 <Button variant="outline" className="border-slate-700 text-white bg-slate-400 hover:bg-slate-800">View Full Gallery</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP PREVIEW */}
        <section className="py-20 container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Unlock Exclusive Benefits</h2>
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
                <h2 className="text-3xl font-bold mb-4">Premium Products</h2>
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
                         <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{prod.name}</h3>
                         <p className="text-purple-400 font-medium mt-1">₹{prod.price}</p>
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
