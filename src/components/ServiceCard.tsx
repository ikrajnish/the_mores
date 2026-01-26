import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

interface ServiceCardProps {
  id: string;
  name: string;
  image?: string;
  price: number;
  duration: number;
  shortDescription?: string;
  categoryName: string;
}

export default function ServiceCard({
  id,
  name,
  image,
  price,
  duration,
  shortDescription,
  categoryName,
}: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
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
          <h3 className="text-lg font-semibold text-slate-50 group-hover:text-purple-400 transition-colors">
            {name}
          </h3>
          <span className="shrink-0 rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-slate-300 border border-slate-600">
            ₹{price}
          </span>
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
            className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
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
