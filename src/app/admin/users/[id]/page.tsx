"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileForm } from "@/components/ProfileForm";
import { BookingHistory } from "@/components/BookingHistory";
import { Button } from "@/components/ui/button";
import { Calendar, Crown, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminUserProfilePage() {
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchUserData = async () => {
            try {
                const res = await fetch(`/api/admin/users/${id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("User not found");
                    throw new Error("Failed to load user data");
                }
                const data = await res.json();
                setUser(data.user);
                setBookings(data.bookings || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
                    <p className="text-xl mb-4">{error || "User not found"}</p>
                    <Link href="/admin/users">
                        <Button variant="outline">Back to Users</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Calculate stats
    const totalSpent = bookings.reduce((acc, b) => acc + (b.pricePaid || 0), 0);
    const membershipName = user.membershipId?.name || "NORMAL";

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/bookings" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
                    </Link>
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-50">{user.name}</h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-slate-400">
                                    <span>{user.phone}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{user.email}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bookings</div>
                                <div className="text-xl font-bold text-slate-200">{bookings.length}</div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spent</div>
                                <div className="text-xl font-bold text-emerald-400">₹{totalSpent}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Membership Card */}
                        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Crown className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Membership Tier</div>
                                    <div className="text-xl font-bold text-indigo-100">{membershipName}</div>
                                </div>
                             </div>
                             {user.membershipId && (
                                <div className="text-sm text-indigo-300/80">
                                    Expires: {user.membershipExpiresAt ? format(new Date(user.membershipExpiresAt), 'PPP') : 'N/A'}
                                </div>
                             )}
                        </div>

                        {/* Profile Details */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-50 mb-4">Account Details</h2>
                            <ProfileForm user={user} readOnly={true} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                                <Calendar className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-slate-50">Booking History</h2>
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
