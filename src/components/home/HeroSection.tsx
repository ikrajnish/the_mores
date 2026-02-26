"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  // Framer Motion variants for staggered animations
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2 } },
  };

  return (
    <section 
      className="relative min-h-[90svh] flex items-center bg-slate-950 text-white overflow-hidden pt-24 pb-16 lg:py-0"
      aria-label="Welcome to Mores Salon overview"
    >
      {/* Background Ambient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px] transform -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content Column */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col space-y-6 lg:max-w-xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm w-fit">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium tracking-wide text-amber-100 uppercase">Ranchi's Premier Luxury Destination</span>
            </motion.div>

            <motion.h1 
              variants={fadeUp} 
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-100"
            >
              Elevate Your <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Beauty & Confidence
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeUp} 
              className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-lg"
            >
              Tired of ordinary salon experiences? Discover bespoke hair, skin, and wellness treatments designed for your unique aesthetic. Step in for service, step out empowered.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/services" className="w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full" aria-label="Book your transformation appointment">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300 hover:-translate-y-1"
                >
                  Book Transformation <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/memberships" className="w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full" aria-label="Explore VIP memberships">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto rounded-full border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white h-14 px-8 text-lg bg-transparent backdrop-blur-sm transition-all duration-300 group"
                >
                  Explore VIP Perks
                  <ShieldCheck className="w-5 h-5 ml-2 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/60 mt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-xl font-bold">4.9/5</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Average Rating</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-xl font-bold">10k+</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Happy Clients</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  <span className="text-xl font-bold">Awarded</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Top Experts</p>
              </div>
            </motion.div>
            
          </motion.div>

          {/* Right Visual Column (Desktop Grid Offset) */}
          <motion.div 
            variants={fadeLeft}
            initial="hidden"
            animate="show"
            className="relative lg:h-[600px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0"
          >
            {/* Main Premium Image */}
            <div className="relative w-full max-w-md aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
               <Image 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop"
                  alt="A professional hairstylist providing luxury salon service to a client"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
               />
               {/* Soft overlay gradient for image depth */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>

            {/* Floating Trust Card */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 lg:-left-12 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce hover:animate-none transition-all duration-500 ease-in-out" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                   <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Verified Excellence</p>
                  <p className="text-xs text-slate-400">100% Satisfaction Guarantee</p>
                </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full blur-[40px] opacity-40 z-[-1]" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
