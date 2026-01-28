"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from "framer-motion";

interface GalleryItem {
  _id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string; // For videos
  caption?: string; 
}

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export function GallerySection({ gallery }: GallerySectionProps) {
  const targetRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  // Measure content width for exact scrolling
  useEffect(() => {
    const updateScrollRange = () => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const clientWidth = window.innerWidth;
            const range = scrollWidth - clientWidth; 
            setScrollRange(range > 0 ? range : 0);
        }
    };

    updateScrollRange();
    window.addEventListener('resize', updateScrollRange);
    return () => window.removeEventListener('resize', updateScrollRange);
  }, [gallery]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Transform vertical scroll to horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  if (!gallery || gallery.length === 0) {
      return null;
  }

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-slate-900">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
         {/* Fixed Header */}
         <div className="absolute top-4 md:top-8 left-0 right-0 z-20 text-center pointer-events-none px-4">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="inline-block"
            >
               <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">Mores Gallery</h2>
               <p className="text-sm md:text-lg text-slate-400">A glimpse into our world of style and sophistication.</p>
            </motion.div>
         </div>

         {/* Horizontal Scrolling Track */}
         <motion.div 
             ref={scrollRef}
             style={{ x }} 
             className="flex gap-6 md:gap-8 px-[5vw] md:px-[10vw] items-center h-full w-max pt-24 md:pt-0"
        >
            {gallery.map((item) => (
               <div 
                 key={item._id} 
                 className="relative w-[80vw] md:w-[500px] h-[50vh] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl shrink-0 group border border-slate-700 bg-slate-800"
               >
                  {/* Image/Media */}
                  <div className="absolute inset-0 z-0">
                      {item.mediaUrl ? (
                          <Image 
                            src={item.mediaUrl} 
                            alt="Gallery code" 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105" 
                            sizes="(max-width: 768px) 80vw, 500px"
                          />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                       )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>

                  {/* Hover Overlay Content */}
                   <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <div className="flex items-center justify-between">
                         <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">Mores Moments</span>
                         <Instagram className="w-5 h-5 text-white" />
                      </div>
                   </div>
               </div>
            ))}
            
            {/* View Full Gallery Card */}
            <div className="w-[80vw] md:w-[400px] h-[50vh] md:h-[600px] flex items-center justify-center flex-shrink-0">
               <div className="text-center p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">See More Moments</h3>
                  <Link href="/gallery">
                    <Button size="lg" className="rounded-full bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors font-bold">
                        View Full Gallery
                    </Button>
                  </Link>
               </div>
            </div>

         </motion.div>
      </div>
    </section>
  );
}
