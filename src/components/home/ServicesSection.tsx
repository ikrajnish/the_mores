"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from "framer-motion";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface ServicesSectionProps {
  categories: Category[];
}

export function ServicesSection({ categories }: ServicesSectionProps) {
  const targetRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);

  // Measure content width for exact scrolling
  React.useEffect(() => {
    const updateScrollRange = () => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const clientWidth = window.innerWidth;
            setViewportWidth(clientWidth);
            // Calculate how much we need to translate to reach the end
            // We subtract clientWidth to stop when the right edge hits the screen edge
            // We can add a bit of buffer if needed, but usually this is exact.
            const range = scrollWidth - clientWidth; 
            setScrollRange(range > 0 ? range : 0);
        }
    };

    updateScrollRange();
    window.addEventListener('resize', updateScrollRange);
    return () => window.removeEventListener('resize', updateScrollRange);
  }, [categories]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Dynamic transform based on measured width
  // Note: We use a key on the motion.div or section to force re-render if needed, 
  // but changing the output range of useTransform should react correctly if we recreate it.
  // Actually, useTransform hook creates a new generic if dependencies change? 
  // Standard way is to rely on re-render.
  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  if (!categories || categories.length === 0) {
     return (
        <section className="py-24 container mx-auto px-4 text-center">
             <p className="text-slate-500">No services found.</p>
        </section>
     )
  }

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
         {/* Fixed Header */}
         <div className="absolute top-4 md:top-8 left-0 right-0 z-20 text-center pointer-events-none px-4">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="inline-block"
            >
               <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">Our Services</h2>
               <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400">Expert care for every part of you.</p>
            </motion.div>
         </div>

         {/* Horizontal Scrolling Track */}
         <motion.div 
            ref={scrollRef}
            style={{ x }} 
            className="flex gap-6 md:gap-12 px-[5vw] md:px-[10vw] items-center h-full w-max pt-36 md:pt-0"
         >
            {categories.map((cat) => (
              <Link 
                key={cat._id} 
                href={`/services?category=${encodeURIComponent(cat.name)}`} 
                className="relative w-[85vw] md:w-[600px] h-[55vh] md:h-[450px] rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 group hover:shadow-2xl transition-all duration-500 flex-shrink-0 bg-white dark:bg-slate-900"
              >
                  {cat.image ? (
                      <>
                        <Image 
                            src={cat.image} 
                            alt={cat.name} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 80vw, 600px" 
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                      </>
                  ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <span className="text-slate-400">No Image</span>
                      </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">{cat.name}</h3>
                    <div className="flex items-center text-amber-400 font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:translate-x-4 group-hover:translate-x-0">
                       Explore Services <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>
              </Link>
            ))}
         </motion.div>
      </div>
    </section>
  );
}
