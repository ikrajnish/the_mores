"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { BookingHistory } from "@/components/BookingHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Crown, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function UserProfileModal({ userId, isOpen, onClose }: { userId: string, isOpen: boolean, onClose: () => void }) {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen || !userId) return;

        setLoading(true);
        setError("");
        
        const fetchUserData = async () => {
            try {
                const res = await fetch(`/api/admin/users/${userId}`);
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
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-slate-200 h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-slate-900">
                    <DialogTitle className="text-slate-50">Guest Profile</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                        </div>
                    ) : error || !user ? (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            <p>{error || "User data unavailable"}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-slate-300 shrink-0">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-50">{user.name}</h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-400">
                                            <span>{user.phone}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>{user.email}</span>
                                            <Badge variant="outline" className="ml-2 border-slate-700 text-slate-400 h-5 text-[10px]">
                                                {user.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 px-4 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Visits</div>
                                        <div className="text-lg font-bold text-slate-200">{bookings.length}</div>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 px-4 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Spent</div>
                                        <div className="text-lg font-bold text-slate-200">₹{bookings.reduce((acc, b) => acc + (b.pricePaid || 0), 0)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Membership and Details */}
                                <div className="space-y-6">
                                    {/* Membership Card */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Crown className="w-6 h-6 text-slate-400" />
                                                <h3 className="text-lg font-semibold text-slate-200">
                                                    {user.membershipId?.name || "No Membership"}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {user.membershipId 
                                                    ? `Member since ${format(new Date(), 'MMM yyyy')}` 
                                                    : "Regular customer"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                                            Contact Details
                                        </h3>
                                        <ProfileForm user={user} readOnly />
                                    </div>
                                </div>

                                {/* Right Column: Booking History */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                         <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-slate-400" />
                                                Recent Bookings
                                            </h3>
                                        </div>
                                        <BookingHistory bookings={bookings} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
