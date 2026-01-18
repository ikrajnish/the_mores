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
    <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
            {name}
          </h3>
          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            ₹{price}
          </span>
        </div>

        <p className="mb-4 text-sm text-gray-500 line-clamp-2">
          {shortDescription || "No description available."}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1.5 h-4 w-4" />
            {duration} mins
          </div>
          
          <Link
            href={`/services/${categoryName}/${id}`}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
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
