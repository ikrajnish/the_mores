import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

async function getBooking(id: string) {
  await connectDB();
  const booking = await Booking.findById(id).populate("serviceId").lean();
  if (!booking) return null;

  return {
    ...booking,
    _id: booking._id.toString(),
    userId: booking.userId.toString(),
    serviceId: {
      ...(booking.serviceId as any),
      _id: (booking.serviceId as any)._id.toString(),
      categoryId: (booking.serviceId as any).categoryId.toString(),
    },
    date: booking.date,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingConfirmationPage(props: PageProps) {
  const session = await auth();
  if (!session) {
      // If not logged in, technically they shouldn't see this, but for now we allow
      // or we could redirect to login.
  }

  const { id } = await props.params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-green-600 p-8 text-center text-white">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-green-100 opacity-90">
              Your appointment has been successfully scheduled.
            </p>
          </div>

          <div className="p-8 space-y-6">
             <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-4">
                    <span className="text-gray-500 text-sm">Booking ID</span>
                     <span className="text-gray-900 font-mono text-sm">{booking._id.slice(-8).toUpperCase()}</span>
                </div>

                <div className="flex items-start gap-3">
                     <div className="mt-1 bg-amber-50 p-2 rounded-lg text-amber-600">
                         {/* Icon placeholder or service icon */}
                         <Calendar className="w-5 h-5" />
                     </div>
                     <div>
                         <p className="font-semibold text-gray-900 text-lg">{booking.serviceId.name}</p>
                         <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {booking.serviceId.duration} mins
                         </div>
                     </div>
                </div>

                 <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                     <div className="flex items-center gap-3 text-sm">
                         <Calendar className="w-4 h-4 text-gray-400" />
                         <span className="text-gray-700">
                             {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                         </span>
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                         <Clock className="w-4 h-4 text-gray-400" />
                         <span className="text-gray-700">
                             {booking.slot}
                         </span>
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                         <MapPin className="w-4 h-4 text-gray-400" />
                         <span className="text-gray-700">
                            Mores Salon, 123 Luxury Lane
                         </span>
                     </div>
                 </div>

                 <div className="flex justify-between items-center pt-2">
                     <span className="text-gray-600 font-medium">Amount Paid</span>
                     <span className="text-xl font-bold text-green-600">₹{booking.pricePaid}</span>
                 </div>
             </div>
             
             <div className="space-y-3 pt-4">
                 <Link href="/my-bookings" className="block">
                     <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base">
                        View My Bookings
                     </Button>
                 </Link>
                 <Link href="/" className="block">
                    <Button variant="outline" className="w-full h-12 text-base">
                        Back to Home
                    </Button>
                 </Link>
             </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
