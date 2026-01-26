import Image from "next/image";
import connectDB from "@/lib/db";
import Gallery from "@/models/Gallery";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

async function getGalleryItems() {
  await connectDB();
  // Sort by newest first
  const items = await Gallery.find({}).sort({ createdAt: -1 }).lean();
  return items;
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-50 mb-4">Our Gallery</h1>
          <p className="text-slate-400">
            A glimpse into the luxury and relaxation that awaits you at Mores Salon.
          </p>
        </div>

        {items.length === 0 ? (
           <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
             <p className="text-slate-400">Gallery coming soon.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item: any) => (
              <div 
                key={item._id.toString()} 
                className="relative group overflow-hidden rounded-xl bg-slate-800 aspect-square shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                {item.type === 'video' ? (
                   <div className="flex items-center justify-center h-full text-slate-500 bg-slate-700">
                     <span className="text-xs">Video Placeholder</span>
                   </div>
                ) : (
                  <Image
                    src={item.mediaUrl}
                    alt="Gallery Item"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
