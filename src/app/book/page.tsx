"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@/hooks/useUser";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get("serviceId");
  const { user } = useUser();

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

  const handleBook = async () => {
    if (!selectedSlot || !service) return;
    
    setSubmitting(true);
    setError(null);

    try {
      // 1. Save to Database
      const dateStrIso = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch('/api/user/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              serviceId: service._id,
              date: dateStrIso,
              slot: selectedSlot
          })
      });

      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create booking");
      }

      // 2. WhatsApp Redirection
      const displayDate = format(selectedDate, 'MMM d, yyyy');
      
      // Get user from internal state or fetch fresh if needed, but we can't easily access useUser inside handleBook if it's outside scope.
      // Wait, I should call useUser at component level. I will fix this in next step or use it here if I declared it.
      // I need to declare useUser inside component first.
      
      const message = encodeURIComponent(
        `Hi, I would like to book an appointment.\n\n` +
        `*Service*: ${service.name}\n` +
        `*Date*: ${displayDate}\n` +
        `*Time*: ${selectedSlot}\n` +
        `*Price*: ₹${service.price}\n` +
        (user ? `*Name*: ${user.name}\n*Phone*: ${user.phone}\n` : `*Name*: (Please enter)\n`) +
        `\nPlease confirm my slot.`
      );
      
      const whatsappUrl = `https://wa.me/918102603450?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      // Redirect to My Bookings after a short delay
      setTimeout(() => {
          router.push('/my-bookings');
      }, 1000);

    } catch (err: any) {
      console.error(err);
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
            <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-50 mb-4">Booking Summary</h2>
                
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-950 mb-4">
                    {service.image ? (
                        <Image src={service.image} alt={service.name} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-600">No Image</div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-slate-50">{service.name}</h3>
                <div className="flex items-center text-slate-400 text-sm mt-1 mb-4">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {service.duration} mins
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                    <span className="text-slate-400">Total Price</span>
                    <span className="text-xl font-bold text-amber-500">₹{service.price}</span>
                </div>
            </div>
        </div>

        {/* Right Column: Date & Slot Selection */}
        <div className="lg:col-span-2 space-y-8">
            {/* Date Selection */}
            <section>
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-amber-500" />
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
                                    ? "border-amber-500 bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50" 
                                    : "border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300"
                                }`}
                            >
                                <span className={`text-xs font-medium uppercase ${isSelected ? 'text-amber-500' : 'text-slate-500'}`}>
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
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-amber-500" />
                        Select Time
                    </div>
                    {loadingAvailability && <span className="text-xs text-slate-500 animate-pulse">Checking availability...</span>}
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
                                    ? "bg-slate-900 text-slate-700 cursor-not-allowed line-through border-slate-800" 
                                    : isSelected
                                        ? "border-amber-500 bg-amber-500 text-slate-950 shadow-md transform scale-105 font-bold"
                                        : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                                }`}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
                {bookedSlots.length > 0 && <p className="text-xs text-slate-500 mt-2">* Some slots are unavailable.</p>}
            </section>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-900/50 p-4 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            {/* Submit Buttons */}
            <div className="pt-4 space-y-3">
                <Button 
                    onClick={() => handleBook()} 
                    disabled={!selectedSlot || submitting}
                    size="lg"
                    className="w-full text-lg h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg grid place-items-center border-0"
                >
                    {submitting ? (
                        <div className="flex items-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing Booking...
                        </div>
                    ) : (
                        <div className="flex items-center">
                             {/* WhatsApp Icon */}
                             <svg viewBox="0 0 24 24" className="w-6 h-6 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                             Book & Confirm on WhatsApp
                        </div>
                    )}
                </Button>
                
                <p className="mt-4 text-center text-sm text-slate-500">
                    Your appointment will be reserved instantly.
                </p>
            </div>
        </div>
    </div>
  );
}

export default function BookingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-slate-50 mb-8">Book Appointment</h1>
                <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading...</div>}>
                    <BookingContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
