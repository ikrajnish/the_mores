"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (phone.length < 10) {
        setError("Please enter a valid phone number");
        return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
         window.location.href = '/'; // Full reload/redirect to ensure state updates
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError("Something went wrong");
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
                <Input 
                    id="phone"
                    placeholder="9999999999" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="text-lg tracking-wider"
                    type="tel"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md text-center">
                    {error}
                </div>
            )}

            <Button onClick={handleSubmit} disabled={loading || phone.length < 10} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? "Saving..." : "Complete Profile"}
                {!loading && <CheckCircle2 className="w-4 h-4 ml-2" />}
            </Button>
        </div>
      </div>
    </div>
  );
}
