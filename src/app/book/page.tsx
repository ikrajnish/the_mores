"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get("serviceId");

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 7 days for selection
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  // Mock time slots
  const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  useEffect(() => {
    if (!serviceId) return;

    fetch(`/api/services/${serviceId}`)
      .then(res => {
        if (!res.ok) throw new Error("Service not found");
        return res.json();
      })
      .then(data => {
        setService(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load service details. Please try again.");
        setLoading(false);
      });

  }, [serviceId]);

  // Fetch availability when date or service changes
  useEffect(() => {
    if (!serviceId || !selectedDate) return;

    setLoadingAvailability(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    fetch(`/api/bookings/availability?serviceId=${serviceId}&date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
         if (data.bookedSlots) {
             setBookedSlots(data.bookedSlots);
         }
      })
      .catch(err => console.error("Failed to fetch availability", err))
      .finally(() => setLoadingAvailability(false));
  }, [serviceId, selectedDate]);

  const handleBook = async (paymentMethod: 'ONLINE' | 'CASH') => {
    if (!selectedSlot || !service) return;
    
    if (paymentMethod === 'ONLINE') {
        alert("Online payment is currently disabled. Please choose 'Pay at Venue'.");
        return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service._id,
          date: selectedDate,
          slot: selectedSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      router.push(`/book/confirmation/${data.bookingId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!serviceId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Invalid booking request. No service selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-gray-400" />
        <span className="text-gray-500">Loading service details...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Service Summary */}
        <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
                    {service.image ? (
                        <Image src={service.image} alt={service.name} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                <div className="flex items-center text-gray-500 text-sm mt-1 mb-4">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {service.duration} mins
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <span className="text-gray-600">Total Price</span>
                    <span className="text-xl font-bold text-amber-600">₹{service.price}</span>
                </div>
            </div>
        </div>

        {/* Right Column: Date & Slot Selection */}
        <div className="lg:col-span-2 space-y-8">
            {/* Date Selection */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                    Select Date
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {dates.map((date) => {
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <button
                                key={date.toString()}
                                onClick={() => {
                                    setSelectedDate(date);
                                    setSelectedSlot(null);
                                }}
                                className={`flex min-w-[80px] flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                                    isSelected 
                                    ? "border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600" 
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                    {format(date, 'EEE')}
                                </span>
                                <span className="text-lg font-bold">
                                    {format(date, 'd')}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Time Slot Selection */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-amber-600" />
                        Select Time
                    </div>
                    {loadingAvailability && <span className="text-xs text-gray-400 animate-pulse">Checking availability...</span>}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {timeSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        const isBooked = bookedSlots.includes(slot);
                        return (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                disabled={isBooked}
                                className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                                    isBooked 
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through" 
                                    : isSelected
                                        ? "border-amber-600 bg-amber-600 text-white shadow-md transform scale-105"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
                {bookedSlots.length > 0 && <p className="text-xs text-gray-400 mt-2">* Some slots are unavailable.</p>}
            </section>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            {/* Submit Buttons */}
            <div className="pt-4 space-y-3">
                <Button 
                    onClick={() => handleBook('CASH')} 
                    disabled={!selectedSlot || submitting}
                    size="lg"
                    className="w-full text-lg h-12 bg-gray-900 hover:bg-gray-800"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Pay at Venue / Book Now"
                    )}
                </Button>
                
                <Button 
                    onClick={() => handleBook('ONLINE')}
                    disabled={!selectedSlot || submitting}
                    variant="outline"
                    className="w-full h-12 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                    Pay Online (Coming Soon)
                </Button>
                
                <p className="mt-4 text-center text-sm text-gray-500">
                    By booking, you agree to our terms of service.
                </p>
            </div>
        </div>
    </div>
  );
}

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>
                <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
                    <BookingContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
