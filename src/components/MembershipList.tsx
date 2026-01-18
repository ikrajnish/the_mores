"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";

interface IMem {
    _id: string;
    name: string;
    price: number;
    description: string;
    benefits: string[];
}

export function MembershipList({ memberships }: { memberships: IMem[] }) {
    const { user } = useUser();
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleClaim = async () => {
        if (!selectedId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/memberships/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ membershipId: selectedId }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess(true);
            } else {
                alert(data.error || "Failed to upgrade");
            }
        } catch (e) {
            console.error(e);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setSelectedId(null);
        router.refresh(); 
    };

    return (
        <main className="flex-grow container mx-auto px-4 py-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-purple-600 font-semibold tracking-wider text-sm">MEMBERSHIPS</span>
                <h1 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Unlock Exclusive Perks</h1>
                <p className="text-slate-600">
                    Join the Mores Elite club and enjoy premium benefits, priority bookings, and significant discounts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {memberships.map((tier) => (
                    <div 
                        key={tier._id} 
                        className={`relative flex flex-col p-8 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                            tier.name === 'GOLD' ? 'border-amber-400 shadow-amber-100 ring-1 ring-amber-100' : 'border-slate-200'
                        }`}
                    >
                        {tier.name === 'GOLD' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg">
                                MOST POPULAR
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-slate-900">₹{tier.price.toLocaleString()}</span>
                                <span className="ml-1 text-slate-500 text-sm">/ year</span>
                            </div>
                            <p className="mt-4 text-slate-500 text-sm">{tier.description}</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-grow">
                            {tier.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                    <span className="text-slate-600 text-sm">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Button 
                            className={`w-full ${
                                tier.name === 'PLATINUM' ? 'bg-slate-900 text-white hover:bg-slate-800' : 
                                tier.name === 'GOLD' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                                'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                            onClick={() => {
                                if (!user) {
                                    router.push('/login');
                                } else {
                                    setSelectedId(tier._id);
                                }
                            }}
                        >
                            Claim Membership
                        </Button>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                <DialogContent>
                    {!success ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>Confirm Membership Upgrade</DialogTitle>
                                <DialogDescription>
                                    You are about to upgrade to a premium plan. Payment gateway is integrated (mock mode).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-lg">
                                <p className="text-sm font-medium text-slate-900">Amount to Pay</p>
                                <p className="text-3xl font-bold text-green-600">
                                    ₹{memberships.find(m => m._id === selectedId)?.price.toLocaleString()}
                                </p>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
                                <Button onClick={handleClaim} disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Pay Now (Mock)
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <Crown className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome to the Club!</h2>
                            <p className="text-slate-600 mt-2 mb-6">
                                Your membership has been activated successfully. Enjoy your exclusive benefits.
                            </p>
                            <Button onClick={handleClose} className="w-full">
                                Awesome
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
