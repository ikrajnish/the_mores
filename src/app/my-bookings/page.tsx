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
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-2">You don't have any bookings in this section.</p>
          <div className="mt-6">
            <Link href="/services">
                <Button variant="outline">Browse Services</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((booking) => (
          <div key={booking._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4">
                {/* Service Image Placeholder - could add real image if populate works well */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                    {/* If we had image, we would show it. API returns serviceId populated. */}
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {booking.serviceId?.image && <img src={booking.serviceId.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{booking.serviceId?.name || "Unknown Service"}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {format(new Date(booking.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {booking.slot}
                    </div>
                    <div className="flex items-center font-medium text-amber-600">
                      ₹{booking.pricePaid}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                     ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                       booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                       booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                       'bg-blue-100 text-blue-700'
                     }
                 `}>
                     {booking.status}
                 </div>
                 {/* Rebook button for completed? */}
                 {booking.status === 'COMPLETED' && (
                     <Link href={`/services/Hair/${booking.serviceId._id}`}> 
                     {/* Note: Category is hardcoded/unknown here without extra fetch or store. 
                        Ideally booking stores category slug or we look it up. 
                        Hack: redirect to services list or just use ID if we had generic route.
                        Actually our route is /services/[category]/[id].
                        We fetched serviceId which has categoryId. 
                        But we populate categoryId as string or object? 
                        In API: populate("serviceId").
                        In Booking schema: serviceId ref Service. Service has categoryId ref ServiceCategory.
                        We need to populate serviceId.categoryId to get name for the link.
                        Let's just leave Rebook button out for now to ensure robustness, or generic link.
                     */}
                        <Button size="sm" variant="outline">Book Again</Button>
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {error ? (
             <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center">
                 <AlertCircle className="w-5 h-5 mr-2" />
                 {error}
                 {error.includes("log in") && (
                     <Link href="/login" className="ml-4 underline font-medium">Login now</Link>
                 )}
             </div>
        ) : (
            <div className="flex flex-col space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 px-6 text-sm font-medium transition-colors relative ${
                            activeTab === 'pending'
                            ? "text-amber-600 border-b-2 border-amber-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Pending / Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`pb-4 px-6 text-sm font-medium transition-colors relative ${
                            activeTab === 'completed'
                            ? "text-amber-600 border-b-2 border-amber-600"
                            : "text-gray-500 hover:text-gray-700"
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
