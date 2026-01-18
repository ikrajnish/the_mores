"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mobile" | "email" | "sso">("mobile");
  
  // Mobile Flow
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        // Redirect
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Verify failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mores Salon
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Welcome back to luxury</p>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-slate-100 dark:border-slate-800">
          <TabButton 
            active={activeTab === "mobile"} 
            onClick={() => setActiveTab("mobile")} 
            label="Mobile" 
            icon={<Smartphone className="w-4 h-4 mr-2" />} 
          />
          <TabButton 
            active={activeTab === "email"} 
            onClick={() => setActiveTab("email")} 
            label="Email" 
            icon={<Mail className="w-4 h-4 mr-2" />} 
          />
          <TabButton 
            active={activeTab === "sso"} 
            onClick={() => setActiveTab("sso")} 
            label="SSO" 
            icon={<ShieldCheck className="w-4 h-4 mr-2" />} 
          />
        </div>

        {/* Content */}
        <div className="p-8 h-[320px] relative">
          <AnimatePresence mode="wait">
            
            {/* MOBILE OTP FLOW */}
            {activeTab === "mobile" && (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <Input 
                        placeholder="9999999999" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-lg tracking-wider"
                      />
                      <p className="text-xs text-slate-400">
                        Try <strong>9999999999</strong> for Admin, <strong>8888888888</strong> for Customer.
                      </p>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button onClick={handleSendOtp} disabled={loading || phone.length < 10} className="w-full">
                      {loading ? "Sending..." : "Get OTP"}
                      {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </>
                ) : (
                  <>
                     <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Enter OTP
                      </label>
                      <Input 
                        placeholder="123456" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="text-lg tracking-[0.5em] text-center"
                        maxLength={6}
                      />
                       <p className="text-xs text-slate-400 text-center">
                        Code sent to {phone}. (Use <strong>123456</strong>)
                      </p>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className="w-full bg-pink-600 hover:bg-pink-700">
                      {loading ? "Verifying..." : "Login"}
                      {!loading && <CheckCircle2 className="w-4 h-4 ml-2" />}
                    </Button>
                    <button 
                      onClick={() => setOtpSent(false)}
                      className="w-full text-xs text-slate-500 mt-2 hover:underline"
                    >
                      Change Phone Number
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* EMAIL MAGIC LINK FLOW */}
            {activeTab === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                   Magic Link implementation requires email provider setup. This is a placeholder for the UI logic.
                 </div>
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input placeholder="user@example.com" />
                 </div>
                 <Button disabled className="w-full">
                   Send Magic Link
                 </Button>
              </motion.div>
            )}

             {/* SSO FLOW */}
             {activeTab === "sso" && (
              <motion.div
                key="sso"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 flex flex-col items-center justify-center h-full pt-4"
              >
                  <Button variant="outline" className="w-full relative h-12" onClick={() => setActiveTab('mobile')}>
                    <span className="absolute left-4">G</span>
                    Continue with Google
                  </Button>
                   <Button variant="outline" className="w-full relative h-12" onClick={() => setActiveTab('mobile')}>
                    <span className="absolute left-4">A</span>
                    Continue with Apple
                  </Button>
                  <p className="text-xs text-slate-400 text-center mt-4">
                    SSO requires OAuth configuration.
                  </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors relative",
        active ? "text-slate-900 dark:text-slate-100" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      )}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-slate-100" 
        />
      )}
    </button>
  );
}
