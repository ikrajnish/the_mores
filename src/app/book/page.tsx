"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useCallback, Suspense } from "react";
import Image from "next/image";
import useSWR from "swr";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ServiceDTO, AvailabilityResponseDTO, ApiErrorDTO } from "@/types";

// ----------------------------------------------------------------------
// Constants & Fetcher
// ----------------------------------------------------------------------

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
] as const;

const fetcher = (url: string) => fetch(url).then(async (res) => {
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        // Attach extra info to the error object.
        const info = await res.json();
        (error as any).info = info;
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
});

// ----------------------------------------------------------------------

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  const serviceId = searchParams.get("serviceId");

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Data Fetching with SWR
  const { data: service, error: serviceError, isLoading: serviceLoading } = useSWR<ServiceDTO>(
    serviceId ? `/api/services/${serviceId}` : null,
    fetcher
  );

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: availability, isLoading: availabilityLoading } = useSWR<AvailabilityResponseDTO>(
     serviceId ? `/api/bookings/availability?serviceId=${serviceId}&date=${dateStr}` : null,
     fetcher
  );

  const bookedSlots = availability?.bookedSlots || [];

  // Memoized Dates
  const dates = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i)),
  []);

  // Handlers
  const handleBook = useCallback(async () => {
    if (!selectedSlot || !service) return;
    
    setSubmitting(true);
    setSubmitError(null);

    try {
      const dateStrIso = format(selectedDate, "yyyy-MM-dd");
      
      const res = await fetch("/api/user/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              serviceId: service._id,
              date: dateStrIso,
              slot: selectedSlot,
          }),
      });

      if (!res.ok) {
          const data = (await res.json()) as ApiErrorDTO;
          throw new Error(data.error || "Failed to create booking");
      }

      // WhatsApp Redirection
      const displayDate = format(selectedDate, "MMM d, yyyy");
      const userName = user?.name ? `*Name*: ${user.name}\n*Phone*: ${user.phone}\n` : `*Name*: (Please enter)\n`;
      
      const message = encodeURIComponent(
        `Hi, I would like to book an appointment.\n\n` +
        `*Service*: ${service.name}\n` +
        `*Date*: ${displayDate}\n` +
        `*Time*: ${selectedSlot}\n` +
        userName +
        `\nPlease confirm my slot.`
      );
      
      window.open(`https://wa.me/918102603450?text=${message}`, "_blank");
      
      // Redirect
      setTimeout(() => router.push("/my-bookings"), 1000);

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [selectedSlot, service, selectedDate, router, user]);

  // Render Logic
  if (!serviceId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Invalid booking request. No service selected.</p>
      </div>
    );
  }

  if (serviceLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-gray-400" aria-hidden="true" />
        <span className="text-gray-500 text-sm sm:text-base">Loading service details...</span>
      </div>
    );
  }

  if (serviceError || !service) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center flex-col">
            <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
            <p className="text-gray-500">Failed to load service details.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {/* Service Summary */}
      <div className="lg:col-span-1 min-w-0">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-base sm:text-lg font-semibold text-slate-50 mb-3 sm:mb-4">Booking Summary</h2>
          
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-950 mb-3 sm:mb-4">
            {service.image ? (
              <Image 
                src={service.image} 
                alt={service.name} 
                fill 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600">No Image</div>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-50 break-words line-clamp-2">{service.name}</h3>
          
          <div className="flex items-center text-slate-400 text-xs sm:text-sm mt-1 sm:mt-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" aria-hidden="true" />
            {service.duration} mins
          </div>
        </div>
      </div>

      {/* Date & Slot Selection */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
        
        {/* Date Selection */}
        <section className="w-full">
          <h3 className="text-base sm:text-lg font-semibold text-slate-50 mb-3 sm:mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-amber-500 shrink-0" aria-hidden="true" />
            Select Date
          </h3>
          
          <div className="w-full flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible">
            {dates.map((date) => {
              const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
              
              return (
                <button
                  key={date.toString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "snap-start shrink-0 flex min-w-[72px] flex-col items-center justify-center rounded-xl border p-2 sm:p-3 transition-all",
                    isSelected 
                      ? "border-amber-500 bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50" 
                      : "border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300"
                  )}
                >
                  <span className={cn("text-xs font-medium uppercase", isSelected ? "text-amber-500" : "text-slate-500")}>
                    {format(date, "EEE")}
                  </span>
                  <span className="text-base sm:text-lg font-bold">
                    {format(date, "d")}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time Selection */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-50 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-amber-500 shrink-0" aria-hidden="true" />
              Select Time
            </h3>
            {availabilityLoading && (
              <span className="text-xs text-slate-500 animate-pulse whitespace-nowrap ml-2">Checking...</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TIME_SLOTS.map((slot) => {
              const matchesSlot = selectedSlot === slot;
              const isBooked = bookedSlots.includes(slot);
              
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  disabled={isBooked}
                  className={cn(
                    "rounded-lg border py-3 px-2 text-xs sm:text-sm font-medium transition-all",
                    isBooked 
                      ? "bg-slate-900 text-slate-700 cursor-not-allowed line-through border-slate-800" 
                      : matchesSlot
                        ? "border-amber-500 bg-amber-500 text-slate-950 shadow-md md:scale-105 font-bold"
                        : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                  )}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          
          {bookedSlots.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">* Some slots are unavailable.</p>
          )}
        </section>

        {/* Error State */}
        {submitError && (
          <div className="rounded-lg bg-red-900/20 border border-red-900/50 p-4 text-xs sm:text-sm text-red-400 flex items-start break-words" role="alert">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-2 space-y-3">
          <Button 
            onClick={handleBook} 
            disabled={!selectedSlot || submitting}
            size="lg"
            className="w-full h-auto min-h-[3.5rem] py-3 text-base sm:text-lg bg-green-600 hover:bg-green-700 text-white shadow-none md:hover:shadow-xl transition-all border-0 whitespace-normal"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin shrink-0" aria-hidden="true" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center text-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Book & Confirm on WhatsApp
              </div>
            )}
          </Button>
          
          <p className="px-2 text-center text-xs sm:text-sm text-slate-500 leading-relaxed">
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
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full overflow-x-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-6 sm:mb-8">Book Appointment</h1>
        <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading...</div>}>
          <BookingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
