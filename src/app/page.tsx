import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/db";
import ServiceCategory from "@/models/ServiceCategory";
import Gallery from "@/models/Gallery";
import Product from "@/models/Product";
import Membership from "@/models/Membership";
import Link from "next/link";
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

export default async function Home() {
  const { categories, gallery, products } = await getHomeData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative h-[600px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Elevate Your Beauty
            </h1>
            <p className="text-lg md:text-xl text-slate-200">
              Experience the pinnacle of luxury hair, skin, and wellness treatments at Mores Salon.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/services">
                <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
                  Book Appointment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/memberships">
                <Button variant="outline" size="lg" className="rounded-full border-white text-white hover:bg-white/10">
                  View Memberships
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICES PREVIEW */}
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Our Services</h2>
              <p className="text-slate-500">Expert care for every part of you.</p>
            </div>
            <Link href="/services" className="text-purple-600 font-medium hover:underline">View All</Link>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat: any) => (
                <Link key={cat._id.toString()} href={`/services?category=${cat._id}`} className="group">
                  <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-end transition-all hover:shadow-xl hover:scale-[1.02]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{cat.name}</h3>
                    <div className="flex items-center text-slate-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
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
        </section>

        {/* GALLERY PREVIEW */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Mores Gallery</h2>
              <p className="text-slate-400">A glimpse into our world of style and sophistication.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Fetch from DB or use placeholders if empty */}
               {gallery.length > 0 ? gallery.map((item: any, i: number) => (
                 <div key={item._id.toString()} className={`aspect-square rounded-xl overflow-hidden bg-slate-800 ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                    {item.mediaUrl ? (
                         /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.mediaUrl} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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
                 <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">View Full Gallery</Button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             {/* SILVER */}
             <div className="relative rounded-2xl p-8 border border-slate-200 bg-white hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
                  <Star className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Silver</h3>
                <p className="text-slate-500 mb-6 text-sm">Perfect for regular visitors.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm gap-2"><Sparkles className="w-4 h-4 text-purple-600"/> Special Member Pricing</div>
                  <div className="flex items-center text-sm gap-2"><Sparkles className="w-4 h-4 text-purple-600"/> Priority Booking</div>
                </div>
                <Button variant="outline" className="w-full">Learn More</Button>
             </div>

             {/* GOLD */}
             <div className="relative rounded-2xl p-8 border border-yellow-200 bg-gradient-to-b from-yellow-50 to-white shadow-xl scale-105 z-10">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                  <Star className="w-6 h-6 text-yellow-600 fill-current" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Gold</h3>
                <p className="text-slate-500 mb-6 text-sm">For the ultimate luxury experience.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm gap-2"><Sparkles className="w-4 h-4 text-yellow-600"/> Best Pricing Tiers</div>
                  <div className="flex items-center text-sm gap-2"><Sparkles className="w-4 h-4 text-yellow-600"/> Complimentary Add-ons</div>
                  <div className="flex items-center text-sm gap-2"><Sparkles className="w-4 h-4 text-yellow-600"/> Dedicated Concierge</div>
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 hover:opacity-90">Get Gold</Button>
             </div>

             {/* NORMAL/VIP PLACEHOLDER */}
              <div className="relative rounded-2xl p-8 border border-slate-200 bg-white hover:shadow-xl transition-all opacity-80">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
                  <UserIconPlaceholder /> 
                </div>
                <h3 className="text-2xl font-bold mb-2">Guest</h3>
                <p className="text-slate-500 mb-6 text-sm">Pay as you go service.</p>
                 <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm gap-2 text-slate-400"><Sparkles className="w-4 h-4"/> Standard Pricing</div>
                  <div className="flex items-center text-sm gap-2 text-slate-400"><Sparkles className="w-4 h-4"/> Online Booking</div>
                </div>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">Sign Up Free</Button>
                </Link>
             </div>
          </div>
        </section>

         {/* PRODUCTS PREVIEW */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
           <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold">Premium Products</h2>
                <Link href="/products" className="text-purple-600 font-medium hover:underline">Shop All</Link>
              </div>
              
              {products.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {products.map((prod: any) => (
                     <div key={prod._id.toString()} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-lg transition-all">
                       <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center text-slate-400 text-xs">Product Image</div>
                       <h3 className="font-bold text-lg">{prod.name}</h3>
                       <p className="text-purple-600 font-medium mt-1">₹{prod.price}</p>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400">No products available yet.</p>
                </div>
              )}
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
