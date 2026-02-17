"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileForm({ user, readOnly = false }: { user: any, readOnly?: boolean }) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        gender: user?.gender || "MALE", // Default
    });
    const [loading, setLoading] = useState(false);
    
    const [error, setError] = useState<{ message: string, showWhatsapp?: boolean } | null>(null);

    const handleChange = (e: any) => {
        if (readOnly) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (readOnly) return;
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch(`/api/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();

            if (res.ok) {
                alert("Profile updated!");
                window.location.reload(); 
            } else if (res.status === 409) {
                setError({ 
                    message: data.error, 
                    showWhatsapp: true 
                });
            } else {
                 setError({ message: data.error || "Failed to update profile" });
            }
        } catch (err) {
            console.error(err);
            setError({ message: "An unexpected error occurred" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Full Name</label>
                    <Input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="bg-slate-950 border-slate-800 text-slate-200"
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Phone</label>
                    <Input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="bg-slate-950 border-slate-800 text-slate-200"
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Email</label>
                    <Input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="bg-slate-950 border-slate-800 text-slate-200"
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Gender</label>
                    <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        className="w-full h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                        disabled={readOnly}
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                     <label className="text-xs font-semibold text-slate-400 mb-1 block">Date of Birth</label>
                     <Input 
                        type="date" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleChange} 
                        className="bg-slate-950 border-slate-800 text-slate-200" 
                        disabled={readOnly}
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-sm text-red-200 animate-in fade-in slide-in-from-top-2">
                    <p className="font-semibold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error.message}
                    </p>
                    {error.showWhatsapp && (
                        <div className="mt-3">
                            <p className="text-xs text-slate-400 mb-2">
                                Provide your details to admin on WhatsApp to merge your old account with this one.
                            </p>
                            <a 
                                href={`https://wa.me/918102603450?text=Hello Admin, I am trying to update my phone number to ${formData.phone} but it says it's already taken. Please merge my walk-in account with my current Google account (${formData.email}).`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-400 hover:text-green-300 font-medium text-xs border border-green-900 bg-green-900/10 px-3 py-2 rounded-md transition-colors hover:bg-green-900/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                                Request Account Merge on WhatsApp
                            </a>
                        </div>
                    )}
                </div>
            )}

            {!readOnly && (
                <div className="pt-2">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    );
}
