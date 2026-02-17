"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [errorOb, setErrorOb] = useState<{ message: string, showWhatsapp?: boolean } | null>(null);

  const handleSubmit = async () => {
    if (phone.length !== 10) {
        setErrorOb({ message: "Please enter a valid 10-digit phone number" });
        return;
    }

    setLoading(true);
    setErrorOb(null);

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${phone}` }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
         window.location.href = '/'; 
      } else if (res.status === 409) {
         setErrorOb({ 
            message: data.error, 
            showWhatsapp: true 
         });
      } else {
        setErrorOb({ message: data.error || "Failed to update profile" });
      }
    } catch (err: any) {
      setErrorOb({ message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">One Last Step</h1>
            <p className="text-slate-500 text-sm mt-1">Please enter your phone number to complete your profile.</p>
        </div>

        <div className="space-y-4">
            <div>
                <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number
                </label>
                <div className="flex gap-2">
                    <select
                        className="flex h-10 w-[90px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                    >
                        <option value="+91">IN +91</option>
                        <option value="+1">US +1</option>
                        <option value="+44">UK +44</option>
                        <option value="+971">UAE +971</option>
                    </select>
                    <Input 
                        id="phone"
                        placeholder="98765 43210" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="text-lg tracking-wider flex-1"
                        type="tel"
                    />
                </div>
                {phone.length > 0 && phone.length < 10 && (
                    <p className="text-xs text-red-500 mt-1 ml-1">Must be exactly 10 digits</p>
                )}
            </div>

            {errorOb && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
                    <p className="font-semibold">{errorOb.message}</p>
                    {errorOb.showWhatsapp && (
                        <div className="mt-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                Provide your details to admin on WhatsApp to merge your old account with this one.
                            </p>
                            <a 
                                href={`https://wa.me/918102603450?text=Hello Admin, I am trying to complete my profile with phone ${countryCode}${phone} but it says it's already taken. Please merge my walk-in account with my current Google account.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-xs border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 px-3 py-2 rounded-md transition-colors w-full justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                                Request Admin to Merge Accounts
                            </a>
                        </div>
                    )}
                </div>
            )}

            <Button onClick={handleSubmit} disabled={loading || phone.length !== 10} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? "Saving..." : "Complete Profile"}
                {!loading && <CheckCircle2 className="w-4 h-4 ml-2" />}
            </Button>
        </div>
      </div>
    </div>
  );
}
