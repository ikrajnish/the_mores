"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Crown, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { getPlanBenefits } from "@/lib/subscription-rules";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyMembershipPage() {
    const { user, loading } = useAuth();
    
    // Memoize benefits config based on user's plan
    const { benefitsConfig, usageMap } = useMemo(() => {
        if (!user || !user.membership) return { benefitsConfig: [], usageMap: new Map() };
        
        const benefits = getPlanBenefits(user.membership.name);
        
        const map = new Map();
        if (user.benefitsUsage) {
            user.benefitsUsage.forEach((u: any) => {
                 if (u.isConsumed) map.set(u.benefitCode, u);
            });
        }
        
        return { benefitsConfig: benefits, usageMap: map };
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-slate-500">Loading membership details...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
             <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold text-slate-50 mb-4">You are not logged in</h1>
                    <Link href="/login">
                        <Button>Login to view membership</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        )
    }

    if (!user.membership) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-12 max-w-2xl text-center">
                    <Crown className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-slate-50 mb-4">No Active Membership</h1>
                    <p className="text-slate-400 mb-8">
                        It looks like you don't have an active subscription plan. Upgrade to Silver or Gold to unlock exclusive benefits and discounts!
                    </p>
                    <Link href="/memberships">
                        <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
                            Explore Plans
                        </Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const isGold = user.membership.name === 'GOLD';
    const isSilver = user.membership.name === 'SILVER';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header Card */}
                    <div className={`
                        relative overflow-hidden rounded-2xl p-8 mb-8 border shadow-2xl
                        ${isGold ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-500/30' : 
                          isSilver ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600/50' : 'bg-slate-900 border-slate-800'}
                    `}>
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Crown className={`w-8 h-8 ${isGold ? 'text-amber-400' : isSilver ? 'text-slate-300' : 'text-slate-500'}`} />
                                    <h1 className={`text-4xl font-bold ${isGold ? 'text-amber-400' : isSilver ? 'text-slate-200' : 'text-slate-500'}`}>
                                        {user.membership.name} MEMBER
                                    </h1>
                                </div>
                                <p className="text-slate-400 max-w-lg">
                                    Enjoy exclusive perks, discounts, and complimentary services designed just for you.
                                </p>
                            </div>
                            
                            <div className="shrink-0 text-right">
                                <div className="text-sm text-slate-500 uppercase font-semibold mb-1">Valid Until</div>
                                <div className="text-xl font-bold text-slate-200 flex items-center justify-end gap-2">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    {user.membershipExpiresAt ? format(parseISO(user.membershipExpiresAt), 'MMM d, yyyy') : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left: Complimentary Services Status */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Your Complimentary Benefits
                            </h2>
                            
                            <div className="grid gap-4">
                                {benefitsConfig.map((benefit: any) => {
                                    const usage = usageMap.get(benefit.code);
                                    const isConsumed = !!usage;
                                    
                                    return (
                                        <div key={benefit.code} className={`
                                            p-5 rounded-xl border transition-all
                                            ${isConsumed 
                                                ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                                                : 'bg-slate-900 border-slate-700 hover:border-slate-600 shadow-lg'}
                                        `}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-bold text-lg ${isConsumed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                            {benefit.name}
                                                        </h3>
                                                        {isConsumed ? (
                                                            <span className="bg-red-900/30 text-red-400 text-xs px-2 py-0.5 rounded border border-red-900/50 font-medium">
                                                                Used
                                                            </span>
                                                        ) : (
                                                            <span className="bg-green-900/30 text-green-400 text-xs px-2 py-0.5 rounded border border-green-900/50 font-medium animate-pulse">
                                                                Available
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-400 mb-3">{benefit.description}</p>
                                                    <div className="text-xs text-slate-500 flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {benefit.period === 'YEARLY' ? 'Once per year' : 'One time'}
                                                        </span>
                                                        {isConsumed && usage.consumedAt && (
                                                            <span>Used on {format(parseISO(usage.consumedAt), 'MMM d, yyyy')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {benefitsConfig.length === 0 && (
                                     <div className="p-6 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                                         No specific tracking benefits configured for this plan.
                                     </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Discounts Summary */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-50">Member Discounts</h2>
                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg">
                                <ul className="space-y-4">
                                    {(user.membership.benefits || []).filter(b => b.toLowerCase().includes('%')).map((b, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                            <span className="text-sm">{b}</span>
                                        </li>
                                    ))}
                                    {(user.membership.benefits || []).filter(b => !b.toLowerCase().includes('%') && !b.toLowerCase().includes('complimentary')).map((b, i) => (
                                        <li key={`other-${i}`} className="flex items-start gap-3 text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 shrink-0"></div>
                                            <span className="text-sm">{b}</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                                    <p className="text-xs text-slate-500 mb-4">
                                        Discounts are automatically applied when you book an appointment.
                                    </p>
                                    <Link href="/book">
                                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                                            Book Service Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
