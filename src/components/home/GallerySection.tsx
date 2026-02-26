"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryItem {
  _id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string; 
}

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export function GallerySection({ gallery }: GallerySectionProps) {
  if (!gallery || gallery.length === 0) {
      return null;
  }

  // Ensure we have at least some items to show, limit to 5 for the bento grid (1 large + 4 small)
  const displayItems = gallery.slice(0, 5);

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">Our Gallery</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Explore our stunning transformations and beauty services</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayItems.map((item, index) => {
                // First item is large (2x2)
                const isLarge = index === 0;
                
                return (
                    <div 
                        key={item._id} 
                        className={`relative overflow-hidden rounded-xl cursor-pointer group ${isLarge ? 'sm:col-span-2 sm:row-span-2 aspect-square' : 'aspect-square'} border border-slate-800 bg-slate-800`}
                    >
                        {/* Media: Video or Image */}
                        <div className="absolute inset-0 w-full h-full">
                            {item.type === 'video' ? (
                                <video
                                    src={item.mediaUrl}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <Image 
                                    src={item.mediaUrl}
                                    alt="Gallery Item"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                                />
                            )}
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-xs font-semibold text-amber-400 mb-1 uppercase tracking-wider">Mores Moments</p>
                            <h3 className={`font-bold text-white ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                                {item.type === 'video' ? 'Video Highlight' : (item.caption || 'Transformation')}
                            </h3>
                        </div>

                        {/* Video Indicator */}
                        {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-amber-500/90 group-hover:scale-110 transition-all duration-300 border border-white/20">
                                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                                </div>
                            </div>
                        )}

                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
                            {item.type === 'video' ? 'Reel' : 'Photo'}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="text-center mt-12">
           <Link href="/gallery">
             <Button size="lg" className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300 font-bold px-8">
                View Full Gallery
             </Button>
           </Link>
        </div>
      </div>
    </section>
  );
}
