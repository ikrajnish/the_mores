"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Benefit {
    code: string;
    name: string;
    isConsumed: boolean;
    consumedAt?: string;
    description?: string;
}

interface Subscription {
    user: {
        _id: string;
        name: string;
        phone: string;
        email?: string;
        image?: string;
    };
    plan: {
        name: string;
        expiresAt: string;
    };
    benefits: Benefit[];
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Modal state
    const [selectedBenefit, setSelectedBenefit] = useState<{ sub: Subscription, benefit: Benefit } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [notes, setNotes] = useState("");

    const fetchSubscriptions = () => {
        setLoading(true);
        fetch('/api/admin/subscriptions')
            .then(res => res.json())
            .then(data => {
                if (data.subscriptions) setSubscriptions(data.subscriptions);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const filteredSubscriptions = subscriptions.filter(sub => 
        sub.user.name?.toLowerCase().includes(search.toLowerCase()) || 
        sub.user.phone?.includes(search) ||
        sub.plan.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleConsume = async () => {
        if (!selectedBenefit) return;
        setProcessing(true);
        
        try {
            await fetch('/api/admin/subscriptions/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedBenefit.sub.user._id,
                    benefitCode: selectedBenefit.benefit.code,
                    isConsumed: !selectedBenefit.benefit.isConsumed, // Toggle
                    notes: notes
                })
            });
            fetchSubscriptions();
            setSelectedBenefit(null);
            setNotes("");
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-50">Active Subscriptions</h1>
                        <p className="text-slate-400">Track and manage user benefits</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm mb-6 relative">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                        placeholder="Search users by name, phone, or plan..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700 w-full md:max-w-md"
                    />
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading subscriptions...</div>
                ) : filteredSubscriptions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center bg-slate-900 rounded-xl border border-slate-800">
                        <Crown className="w-12 h-12 mb-4 text-slate-700" />
                        <p>No active subscriptions found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredSubscriptions.map((sub) => (
                            <div key={sub.user._id} className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col md:flex-row gap-6">
                                {/* Left: User Info */}
                                <div className="flex-shrink-0 md:w-64 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-2 h-12 rounded-full ${
                                            sub.plan.name === 'GOLD' ? 'bg-amber-400' :
                                            sub.plan.name === 'SILVER' ? 'bg-slate-300' : 'bg-slate-600'
                                        }`} />
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-50">{sub.user.name || "Guest User"}</h3>
                                            <p className="text-sm text-slate-400">{sub.user.phone}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 space-y-2">
                                        <Badge variant="outline" className={`
                                            ${sub.plan.name === 'GOLD' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                                              sub.plan.name === 'SILVER' ? 'border-slate-400/50 text-slate-300 bg-slate-400/10' : 'border-slate-700 text-slate-400'}
                                        `}>
                                            {sub.plan.name} PLAN
                                        </Badge>
                                        <div className="text-xs text-slate-500">
                                            Expires: {sub.plan.expiresAt ? format(parseISO(sub.plan.expiresAt), 'PPP') : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Benefits */}
                                <div className="flex-grow">
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Complimentary Benefits</h4>
                                    
                                    <div className="space-y-4">
                                        {sub.benefits.map((benefit) => (
                                            <div key={benefit.code} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    {benefit.isConsumed ? (
                                                        <XCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className={`font-medium ${benefit.isConsumed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                            {benefit.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{benefit.description}</p>
                                                        {benefit.isConsumed && benefit.consumedAt && (
                                                            <p className="text-xs text-red-400 mt-1">
                                                                Consumed on {format(parseISO(benefit.consumedAt), 'MMM d, yyyy')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button 
                                                    size="sm" 
                                                    variant={benefit.isConsumed ? "outline" : "default"}
                                                    className={benefit.isConsumed 
                                                        ? "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800" 
                                                        : "bg-green-600 hover:bg-green-700 text-white"
                                                    }
                                                    onClick={() => setSelectedBenefit({ sub, benefit })}
                                                >
                                                    {benefit.isConsumed ? "Undo" : "Consume"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Dialog open={!!selectedBenefit} onOpenChange={() => setSelectedBenefit(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-slate-50">
                            {selectedBenefit?.benefit.isConsumed ? "Mark as Unconsumed?" : "Confirm Consumption"}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <p className="text-slate-400">
                            {selectedBenefit?.benefit.isConsumed 
                                ? "This will make the benefit available again for the user."
                                : "This action will mark the service as consumed and generate a timestamp."
                            }
                        </p>
                        
                        {!selectedBenefit?.benefit.isConsumed && (
                            <div>
                                <label className="text-sm font-medium mb-2 block text-slate-300">Notes (Optional)</label>
                                <Input 
                                    placeholder="e.g. Which service was chosen?"
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-slate-200" 
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedBenefit(null)} className="text-slate-400 hover:text-white">Cancel</Button>
                        <Button 
                            onClick={handleConsume} 
                            disabled={processing}
                            className={selectedBenefit?.benefit.isConsumed ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                        >
                            {processing ? "Processing..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
