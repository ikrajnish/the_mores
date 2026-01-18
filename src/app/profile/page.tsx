import connectDB from "@/lib/db";
import User from "@/models/User";
import Booking from "@/models/Booking";
import "@/models/Membership"; // Ensure Membership schema is registered
import "@/models/Service"; // Ensure Service schema is registered
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
// Profile form component
import { ProfileForm } from "../../components/ProfileForm";
import { BookingHistory } from "../../components/BookingHistory";
import { Crown, Calendar } from "lucide-react";

async function getUserData() {
  const session = await auth();
  console.log("Profile Page Session:", session);
  if (!session?.user) return null;

  await connectDB();
  // We need to be careful. In our auth, currently session.user.email IS the phone number.
  // We should probably rely on that or fix auth to use phone field.
  // For now, let's try to find by phone OR email just in case.
  const phoneOrEmail = session.user.email;
  const user = await User.findOne({ 
      $or: [{ phone: phoneOrEmail }, { email: phoneOrEmail }] 
  }).populate('membershipId').lean();
  
  console.log("Profile Page User Found:", user ? "Yes" : "No", phoneOrEmail);

  if (!user) return null;
  
  // Fetch bookings
  const bookings = await Booking.find({ userId: user._id })
    .sort({ date: -1 })
    .populate('serviceId')
    .limit(10)
    .lean();

  return { user: JSON.parse(JSON.stringify(user)), bookings: JSON.parse(JSON.stringify(bookings)) };
}

export default async function ProfilePage() {
  const data = await getUserData();

  if (!data) {
     return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Please log in to view profile.</p>
        </div>
     );
  }

  const { user, bookings } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: User Info & Membership */}
            <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                    <ProfileForm user={user} />
                </div>

                {/* Membership Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                           <Crown className="w-5 h-5" />
                           <span className="text-sm font-medium tracking-wider uppercase">Membership</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">
                           {user.membershipId?.name || 'NORMAL'} TIER
                        </h3>
                        {user.membershipId ? (
                            <p className="text-slate-300 text-sm">
                                Enjoy your exclusive {user.membershipId.name} benefits.
                            </p>
                        ) : (
                            <p className="text-slate-300 text-sm">
                                Upgrade to unlock premium perks.
                            </p>
                        )}
                    </div>
                    {/* Decorative bg circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
            </div>

            {/* Right Column: Bookings */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-semibold">Recent Bookings</h2>
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
