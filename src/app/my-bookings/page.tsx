"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    image?: string;
    duration: number;
  };
  date: string;
  slot: string;
  pricePaid: number;
  status: string;
}

interface BookingsData {
  pending: Booking[];
  completed: Booking[];
}

// Metadata moved to layout.tsx because this is a client component

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [bookings, setBookings] = useState<BookingsData>({ pending: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/bookings")
      .then(async (res) => {
        if (res.status === 401) {
             throw new Error("Unauthorized");
        }
        if (!res.ok) {
             throw new Error("Failed to fetch bookings");
        }
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.message === "Unauthorized") {
            setError("Please log in to view specific bookings.");
        } else {
            setError("Failed to load bookings.");
        }
        setLoading(false);
      });
  }, []);

  const renderBookingList = (list: Booking[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-200">No bookings found</h3>
          <p className="text-slate-500 mt-2">You don't have any bookings in this section.</p>
          <div className="mt-6">
            <Link href="/services">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Browse Services</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((booking) => (
          <div key={booking._id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4">
                {/* Service Image Placeholder */}
                <div className="w-16 h-16 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden relative border border-slate-700">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {booking.serviceId?.image ? (
                        <img src={booking.serviceId.image} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Clock className="w-6 h-6" />
                        </div>
                     )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-50 text-lg">{booking.serviceId?.name || "Unknown Service"}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5 text-amber-500" />
                      {format(new Date(booking.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                      {booking.slot}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Pricing Display */}
                        <div className="flex flex-col items-end mr-2">
                            {(booking as any).originalPrice && (booking as any).originalPrice > booking.pricePaid && (
                                <span className="text-xs text-slate-500 line-through">₹{(booking as any).originalPrice}</span>
                            )}
                            <div className={`font-bold ${(booking as any).originalPrice > booking.pricePaid ? 'text-amber-400' : 'text-slate-200'}`}>
                                ₹{booking.pricePaid}
                            </div>
                        </div>
                        {(booking as any).originalPrice && (booking as any).originalPrice > booking.pricePaid && (
                             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Member
                             </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border
                     ${booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                       booking.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                       booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                       'bg-blue-500/10 text-blue-400 border-blue-500/20'
                     }
                 `}>
                     {booking.status}
                 </div>
                 
                 {booking.status === 'COMPLETED' && (
                     <Link href={`/services`}> 
                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Book Again</Button>
                     </Link>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-8 inline-block">My Bookings</h1>

        {error ? (
             <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 flex items-center">
                 <AlertCircle className="w-5 h-5 mr-2" />
                 {error}
                 {error.includes("log in") && (
                     <Link href="/login" className="ml-4 underline font-medium hover:text-red-300">Login now</Link>
                 )}
             </div>
        ) : (
            <div className="flex flex-col space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'pending'
                            ? "text-amber-500 border-b-2 border-amber-500"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        Pending / Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'completed'
                            ? "text-amber-500 border-b-2 border-amber-500"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        Completed
                    </button>
                </div>

                {/* Content */}
                <div>
                     {activeTab === 'pending' ? renderBookingList(bookings.pending) : renderBookingList(bookings.completed)}
                </div>
            </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
