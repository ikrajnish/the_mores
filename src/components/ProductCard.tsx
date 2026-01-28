"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  image?: string;
  price: number;
  brand?: string;
  description?: string;
}

export function ProductCard({ id, name, image, price, brand, description }: ProductCardProps) {
  const handleWhatsAppRequest = () => {
    const message = encodeURIComponent(`Hi, I'm interested in buying: ${name} ( Price: ₹${price.toLocaleString()} ). Please share more details.`);
    window.open(`https://wa.me/918102603450?text=${message}`, '_blank');
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-sm transition-all hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-slate-900">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">No Image</div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
            {brand && <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">{brand}</span>}
            <h3 className="font-bold text-slate-50 line-clamp-2">{name}</h3>
        </div>
        
        <p className="mb-4 text-xs text-slate-400 line-clamp-2 flex-grow">
          {description || "No description available."}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-700">
          <span className="text-lg font-bold text-slate-50">₹{price.toLocaleString()}</span>
          
          <Button onClick={handleWhatsAppRequest} size="sm" className="gap-2 bg-green-600 text-white hover:bg-green-700 border-0">
             <ShoppingBag className="h-4 w-4" />
             Buy on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
