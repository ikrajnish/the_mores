"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from "@/hooks/useUser";
import { motion, useScroll, useTransform } from "framer-motion";

export function BridalSection() {
  const { user } = useUser();
  
  // Refs for Scroll Animation
  const targetRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Measure content width for exact scrolling
  useEffect(() => {
    const updateScrollRange = () => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const clientWidth = window.innerWidth;
            setViewportWidth(clientWidth);
            const range = scrollWidth - clientWidth; 
            setScrollRange(range > 0 ? range : 0);
        }
    };

    updateScrollRange();
    window.addEventListener('resize', updateScrollRange);
    return () => window.removeEventListener('resize', updateScrollRange);
  }, []); // packages is static here, so empty dependency or stable dependency is fine

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Transform vertical scroll to horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  const packages = [
    {
      id: "basics",
      name: "Bridal Care Basics",
      originalPrice: 7000,
      discountedPrice: 6299,
      image: "https://images.unsplash.com/photo-1702312721649-4074deaf4510?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tag: "Essential",
      gradient: "from-pink-400 to-rose-400",
      services: [
          "Brightening Cleanup / Facial",
          "Signature & Advanced Haircut",
          "Deep Nourishing Hair Spa",
          "Full Body Wax (Advanced)",
          "Face D-Tan / Bleach (Advanced)",
          "Pedicure (Basic)",
          "Manicure (Basic)",
          "Full Face Wax (with eyebrows)"
      ]
    },
    {
      id: "signature-glow",
      name: "Signature Bridal Glow",
      originalPrice: 17000,
      discountedPrice: 12999,
      image: "https://images.unsplash.com/photo-1721756176805-a76abbfa5b45?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tag: "Most Popular",
      gradient: "from-amber-400 to-orange-500",
      services: [
           "O3+ Brightening Facial",
           "Premium Body Polishing",
           "Signature & Advanced Haircut",
           "Detox Hair Spa",
           "Full Body Wax (Advanced)",
           "Brazilian Bikini Wax (Optional)",
           "Full Body D-Tan / Bleach (Advanced)",
            "Crystal Manicure",
           "Crystal Pedicure",
           "Full Face Wax"
      ]
    },
    {
      id: "glow-rituals",
      name: "Bridal Glow Rituals",
      originalPrice: 25499,
      discountedPrice: 22999,
      image: "https://images.unsplash.com/photo-1637827604358-2038e2423cc8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tag: "Premium",
      gradient: "from-purple-400 to-indigo-500",
      services: [
        "Haldi Makeup – Classic Glam",
        "Mehndi Makeup – Classic Glam",
        "Bridal Makeup – Studio Ultra HD"
      ]
    },
    {
      id: "signature-rituals",
      name: "Signature Bridal Rituals",
      originalPrice: 33499,
      discountedPrice: 29999,
      image: "https://images.unsplash.com/photo-1684868265714-fd2300637c23?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tag: "Luxury Edit",
      gradient: "from-rose-500 to-pink-600",
      services: [
        "Haldi Makeup – Studio Ultra HD Glam",
        "Mehndi Makeup – Studio Ultra HD Glam",
        "Bridal Makeup – Signature Soft-Matte Finish"
      ]
    }
  ];

  const handleWhatsapp = (pkg: any) => {
      let userDetails = "";
      if (user) {
          userDetails = `\n\n*Name*: ${user.name}\n*Phone*: ${user.phone}`;
      } else {
           userDetails = `\n\n*Name*: (Please fill)\n*Phone*: (Please fill)`;
      }

      const message = `Hi, I am interested in the *${pkg.name}* package (₹${pkg.discountedPrice}). Is it available?${userDetails}`;
      const url = `https://wa.me/918102603450?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <section ref={targetRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
         {/* Fixed Header within the sticky container */}
         <div className="absolute top-4 mb-2 md:top-8 left-0 right-0 z-20 text-center pointer-events-none px-4">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="inline-flex items-center gap-2 py-1 px-3 md:py-1.5 md:px-4 rounded-full bg-amber-100/10 border border-amber-500/30 text-amber-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2 md:mb-4 backdrop-blur-sm"
            >
               <Sparkles className="w-3 h-3" /> Wedding Season 2026
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent drop-shadow-md">The Bridal Collection</h2>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-sm md:max-w-2xl mx-auto">Scroll to explore our exclusive packages</p>
         </div>

         {/* Horizontal Scrolling Track */}
         <motion.div 
             ref={scrollRef}
             style={{ x }} 
             className="flex gap-6 md:gap-12 px-[5vw] md:px-[10vw] items-center h-full w-max pt-36 md:pt-16"
        >
            {packages.map((pkg) => (
               <div 
                 key={pkg.id} 
                 className="relative mt-3 w-[85vw] md:w-[800px] h-[60vh] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shrink-0 group border border-slate-800 bg-slate-900"
               >
                  {/* Background */}
                  <div className="absolute inset-0 z-0">
                      <Image 
                        src={pkg.image} 
                        alt={pkg.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 w-full md:w-2/3 h-full p-6 md:p-12 flex flex-col justify-center">
                      <div className="mb-4 md:mb-6">
                        {pkg.tag && (
                           <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500 text-slate-900 mb-2 md:mb-4 shadow-lg shadow-amber-500/20">
                              {pkg.tag}
                           </span>
                        )}
                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">{pkg.name}</h3>
                        <div className="flex items-baseline gap-2 md:gap-3">
                           <span className="text-xl md:text-3xl font-bold text-amber-500">₹{pkg.discountedPrice.toLocaleString()}</span>
                           <span className="text-sm md:text-lg line-through text-slate-500">₹{pkg.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-4 md:gap-y-2 mb-6 md:mb-8 overflow-y-auto max-h-[120px] md:max-h-none no-scrollbar">
                         {pkg.services.slice(0, 6).map((item, i) => ( 
                             <li key={i} className="flex items-center gap-2 text-slate-300 text-xs md:text-sm">
                                <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0" />
                                <span className="truncate">{item}</span>
                             </li>
                         ))}
                         {pkg.services.length > 6 && (
                            <li className="text-slate-500 text-[10px] md:text-xs italic md:pl-6">+ {pkg.services.length - 6} more services</li>
                         )}
                      </ul>

                      <Button 
                        onClick={() => handleWhatsapp(pkg)} 
                        className="w-full md:w-fit px-6 md:px-8 h-10 md:h-12 bg-white text-slate-950 font-bold hover:bg-amber-500 hover:text-white transition-colors text-sm md:text-base pointer-events-auto"
                      >
                         Check Availability <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                  </div>
               </div>
            ))}
            
            {/* End Spacer / Call to Action at the end of scroll */}
         </motion.div>
      </div>
    </section>
  );
}
