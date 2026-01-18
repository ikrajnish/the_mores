"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crown, Users, Edit2, Check, UserPlus } from "lucide-react";
import Link from "next/link";
import { Textarea } from "../../../components/ui/textarea"

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [assigningTier, setAssigningTier] = useState<any>(null);

  const fetchMemberships = () => {
    setLoading(true);
    fetch('/api/admin/memberships')
      .then(res => res.json())
      .then(data => {
          if (data.memberships) setMemberships(data.memberships);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
     fetchMemberships();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Membership Tiers</h1>
                <p className="text-slate-500">Manage pricing, benefits, and view user distribution</p>
            </div>
            
            <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
            </Link>
        </div>

        {loading ? (
             <div className="p-8 text-center text-slate-500">Loading memberships...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {memberships.map((tier) => (
                    <div key={tier._id} className={`bg-white rounded-xl border-2 shadow-sm p-6 flex flex-col ${
                        tier.name === 'PLATINUM' ? 'border-slate-800' :
                        tier.name === 'GOLD' ? 'border-amber-400' :
                        tier.name === 'SILVER' ? 'border-slate-300' : 'border-slate-100'
                    }`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-xl">{tier.name}</h3>
                            <Crown className={`w-6 h-6 ${
                                tier.name === 'PLATINUM' ? 'text-slate-800' :
                                tier.name === 'GOLD' ? 'text-amber-500' :
                                tier.name === 'SILVER' ? 'text-slate-400' : 'text-slate-200'
                            }`} />
                        </div>
                        
                        <div className="text-3xl font-bold mb-2">₹{tier.price}</div>
                        <p className="text-sm text-slate-500 mb-4 min-h-[40px]">{tier.description || "No description"}</p>
                        
                        <div className="flex-grow mb-6">
                            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Benefits</h4>
                            <ul className="space-y-1">
                                {tier.benefits?.slice(0, 4).map((b: string, i: number) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>{b}</span>
                                    </li>
                                ))}
                                {tier.benefits?.length > 4 && (
                                    <li className="text-xs text-slate-400 pl-6">+{tier.benefits.length - 4} more</li>
                                )}
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">{tier.userCount}</span> Users
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingTier(tier)}>
                                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setAssigningTier(tier)}>
                                    <UserPlus className="w-4 h-4 mr-1" /> Add User
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>

      <EditTierModal tier={editingTier} onClose={() => setEditingTier(null)} onSuccess={fetchMemberships} />
      <AssignUserModal tier={assigningTier} onClose={() => setAssigningTier(null)} onSuccess={fetchMemberships} />
      
      <Footer />
    </div>
  );
}

function EditTierModal({ tier, onClose, onSuccess }: any) {
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [benefitsStr, setBenefitsStr] = useState("");

    useEffect(() => {
        if (tier) {
            setPrice(tier.price);
            setDescription(tier.description || "");
            setBenefitsStr(tier.benefits ? tier.benefits.join('\n') : "");
        }
    }, [tier]);

    const handleSave = async () => {
        if (!tier) return;
        const benefits = benefitsStr.split('\n').filter(b => b.trim() !== "");
        
        await fetch('/api/admin/memberships', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: tier._id, price, description, benefits })
        });
        onSuccess();
        onClose();
    };

    if (!tier) return null;

    return (
        <Dialog open={!!tier} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit {tier.name} Tier</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                     <div>
                        <label className="text-sm font-medium mb-1 block">Price (User pays this)</label>
                        <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                     </div>
                     <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} />
                     </div>
                     <div>
                        <label className="text-sm font-medium mb-1 block">Benefits (One per line)</label>
                        <Textarea 
                            className="min-h-[100px]"
                            value={benefitsStr}
                            onChange={(e: any) => setBenefitsStr(e.target.value)}
                        />
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AssignUserModal({ tier, onClose, onSuccess }: any) {
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAssign = async () => {
        if (!identifier || !tier) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/memberships/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, membershipId: tier._id })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(`Successfully assigned ${data.user.name || 'User'} to ${tier.name}!`);
                onSuccess();
                onClose();
            } else {
                alert(data.error || "Failed to assign membership");
            }
        } catch (e) {
            alert("Error assigning membership");
        } finally {
            setLoading(false);
        }
    };

    if (!tier) return null;

    return (
        <Dialog open={!!tier} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add User to {tier.name}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                    <p className="text-sm text-slate-500">
                        Enter the phone number or email of the user you want to add to this tier.
                    </p>
                    <div>
                        <Input 
                            placeholder="Phone or Email" 
                            value={identifier} 
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAssign} disabled={loading || !identifier}>
                        {loading ? "Assigning..." : "Assign Membership"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
