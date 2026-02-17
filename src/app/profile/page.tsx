import connectDB from "@/lib/db";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Membership from "@/models/Membership"; 
import ServicePricing from "@/models/ServicePricing";
import "@/models/Service"; // Keep this for Schema registration if needed, or import standard
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
// Profile form component
import { ProfileForm } from "../../components/ProfileForm";
import { BookingHistory } from "../../components/BookingHistory";
import { Crown, Calendar, AlertCircle } from "lucide-react";

async function getUserData() {
  const session = await auth();
  if (!session?.user) return null;

  await connectDB();
  
  const phoneOrEmail = session.user.email;
  const user = await User.findOne({ 
      $or: [{ phone: phoneOrEmail }, { email: phoneOrEmail }] 
  }).populate('membershipId').lean();

  if (!user) return null;
  
  // Fetch bookings
  const rawBookings = await Booking.find({ userId: user._id })
    .sort({ date: -1 })
    .populate('serviceId', 'name image duration') // Ensure name is populated for BookingHistory
    .lean(); // Fetch ALL bookings for pagination and stats

  // Fetch NORMAL membership ID for price comparison
  const normalMembership = await Membership.findOne({ name: "NORMAL" }).lean();
  const normalMemId = normalMembership ? normalMembership._id : null;

  // Enrich bookings with original price
  const bookings = await Promise.all(rawBookings.map(async (b: any) => {
      let originalPrice = b.pricePaid; // Default to paid if not found/same
      
      if (normalMemId && b.serviceId) {
          const pricing = await ServicePricing.findOne({
              serviceId: b.serviceId._id,
              membershipId: normalMemId
          }).lean();
          if (pricing) {
              originalPrice = pricing.price;
          }
      }
      return { ...b, originalPrice };
  }));

  // Calculate Stats
  const totalBookings = bookings.length;
  let totalSavings = 0;
  bookings.forEach((b: any) => {
      if (b.originalPrice && b.originalPrice > b.pricePaid) {
          totalSavings += (b.originalPrice - b.pricePaid);
      }
  });
  const avgSaving = totalBookings > 0 ? (totalSavings / totalBookings).toFixed(0) : 0;

  return { user: JSON.parse(JSON.stringify(user)), bookings: JSON.parse(JSON.stringify(bookings)), stats: { totalBookings, totalSavings, avgSaving } };
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Mores Salon",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const data = await getUserData();

  if (!data) {
     return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Please log in to view profile.</p>
        </div>
     );
  }

  const { user, bookings, stats } = data;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-50">Welcome, {user.name?.split(' ')[0] || 'User'}</h1>
                    <p className="text-slate-400">Manage your profile and bookings</p>
                </div>
            </div>
            
            {/* Top Stat Removed as requested */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: User Info & Membership */}
            <div className="space-y-8">
                {/* Membership Card */}
                <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-purple-900/10 relative overflow-hidden border border-white/5">
                            {/* Check Expiration */}
                            {(() => {
                                // Default logic: If explicit expiry missing, assume 365 days from last update (approx purchase time)
                                let expiresAt = user.membershipExpiresAt ? new Date(user.membershipExpiresAt) : null;
                                
                                if (!expiresAt && user.updatedAt) {
                                    const derivedDate = new Date(user.updatedAt);
                                    derivedDate.setDate(derivedDate.getDate() + 365);
                                    expiresAt = derivedDate;
                                } else if (!expiresAt) {
                                     // Fallback if absolutely no date (rare): 1 year from now
                                     const now = new Date();
                                     now.setDate(now.getDate() + 365);
                                     expiresAt = now;
                                }

                                const isExpired = expiresAt < new Date();
                                // const daysLeft = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                return (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            {isExpired ? (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30">
                                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                                    <span className="text-xs font-bold tracking-wider uppercase text-red-200">Expired</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                                                    <Crown className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-xs font-bold tracking-wider uppercase text-yellow-100">Member Status</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-6">
                                            <h3 className={`text-3xl font-extrabold tracking-tight mb-1 ${isExpired ? 'text-slate-400 decoration-red-500/50 line-through decoration-2' : ''}`}>
                                            {user.membershipId?.name || 'NORMAL'}
                                            </h3>
                                            <p className={`${isExpired ? 'text-red-300' : 'text-purple-200'} text-sm`}>
                                                {isExpired ? 'Membership benefits inactive' : 'Current Tier'}
                                            </p>
                                        </div>

                                        {user.membershipId ? (
                                            <div className="pt-4 border-t border-white/10">
                                                <p className="text-purple-100 text-sm mb-2">
                                                    {isExpired 
                                                        ? `Your ${user.membershipId.name} benefits have expired. Renew to regain access.` 
                                                        : `Enjoying exclusive benefits of ${user.membershipId.name} membership.`
                                                    }
                                                </p>
                                                <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg inline-flex mt-1 ${isExpired ? 'bg-red-500/10 text-red-200' : 'bg-white/5 text-yellow-200/80'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    {isExpired ? 'Expired on: ' : 'Expires on: '}
                                                    {expiresAt.toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long', 
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-4 border-t border-white/10">
                                                <p className="text-purple-100 text-sm mb-3">
                                                    Upgrade to unlock premium perks & discounts.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 blur-2xl rounded-full translate-y-1/3 -translate-x-1/4" />
                </div>

                {/* Profile Card */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-50">Profile Details</h2>
                    </div>
                    <ProfileForm user={user} />
                </div>
            </div>

            {/* Right Column: Bookings */}
            <div className="lg:col-span-2 space-y-8">
                {/* Stats Section - Moved Above & Separated */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Total Bookings</span>
                            <span className="text-3xl font-bold text-slate-50">{stats.totalBookings}</span>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-amber-500/80 text-xs font-medium uppercase tracking-wider mb-2">Total Savings</span>
                            <span className="text-3xl font-bold text-amber-500">₹{stats.totalSavings}</span>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-emerald-500/80 text-xs font-medium uppercase tracking-wider mb-2">Avg Saving/Visit</span>
                            <span className="text-3xl font-bold text-emerald-500">₹{stats.avgSaving}</span>
                        </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 min-h-[500px]">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-50">Booking History</h2>
                            <p className="text-sm text-slate-400">Your recent appointments and activities</p>
                        </div>
                    </div>
                    <BookingHistory bookings={bookings} />
                </div>
            </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
