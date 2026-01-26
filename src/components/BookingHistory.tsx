"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  _id: string;
  serviceId: { name: string; image?: string; price: number };
  date: string;
  slot: string;
  pricePaid: number;
  status: string;
  originalPrice?: number;
}

export function BookingHistory({ bookings }: { bookings: Booking[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-slate-800/30 border border-slate-700 border-dashed rounded-lg">
        No booking history found.
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
      {currentBookings.map((booking) => {
        const originalPrice = booking.originalPrice || booking.pricePaid;
        const hasSavings = originalPrice > booking.pricePaid;
        
        return (
          <div key={booking._id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-sm hover:shadow-md transition-all hover:bg-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4">
                {/* Service Image Placeholder */}
                <div className="w-16 h-16 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden relative border border-slate-700">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {(booking.serviceId as any)?.image ? (
                        <img src={(booking.serviceId as any).image} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            {/* Simple Clock or Calendar icon fallback if no image */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-6 h-6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                     )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-50 text-lg">{booking.serviceId?.name || "Unknown Service"}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                    <div className="flex items-center">
                       {/* Calendar Icon */}
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-4 h-4 mr-1.5 text-purple-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                       {format(new Date(booking.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                       {/* Clock Icon */}
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-4 h-4 mr-1.5 text-purple-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                       {booking.slot}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 border-slate-700 pt-4 md:pt-0">
                  <div className="flex flex-col items-end mr-2">
                        {hasSavings && (
                            <span className="text-xs text-slate-500 line-through">₹{originalPrice}</span>
                        )}
                        <span className={`font-bold text-lg ${hasSavings ? 'text-amber-400' : 'text-slate-200'}`}>
                            ₹{booking.pricePaid}
                        </span>
                        {hasSavings && (
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded mt-0.5 border border-green-500/20">
                                Member Price
                            </span>
                        )}
                  </div>
                  
                  <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} className={
                      booking.status === 'CONFIRMED' ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : 
                      booking.status === 'COMPLETED' ? "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-700" :
                      booking.status === 'CANCELLED' ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                  }>
                    {booking.status}
                  </Badge>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-sm text-slate-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, bookings.length)} of {bookings.length}
              </span>
              <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
}
