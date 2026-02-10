"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useUser } from "@/hooks/useUser";

interface ServiceCardProps {
  id: string;
  name: string;
  image?: string;
  price: number;
  duration: number;
  shortDescription?: string;
  categoryName: string;
  prices?: Record<string, number>;
}

export default function ServiceCard({
  id,
  name,
  image,
  price,
  duration,
  shortDescription,
  categoryName,
  prices,
}: ServiceCardProps) {
  const { user } = useUser();
  
  const membershipName = user?.membership?.name;
  const normalPrice = prices?.["NORMAL"] || price;
  const memberPrice = (membershipName && membershipName !== "NORMAL" && prices?.[membershipName]) 
    ? prices[membershipName] 
    : null;
    
  const showDiscount = memberPrice !== null && memberPrice < normalPrice;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden ">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            No Image
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-50 transition-colors">
            {name}
          </h3>
          
          <div className="flex flex-col items-end">
            {/* Price hidden as per request */}
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-400 line-clamp-2">
          {shortDescription || "No description available."}
        </p>

        <div className="flex items-center justify-between border-t border-slate-700 pt-4">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="mr-1.5 h-4 w-4" />
            {duration} mins
          </div>
          
          <Link
            href={`/services/${categoryName}/item/${id}`}
            className="text-sm font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1"
          >
            View Details
            <span aria-hidden="true" className="block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
