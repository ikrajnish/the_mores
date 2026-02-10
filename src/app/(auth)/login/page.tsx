"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
        // 1. Firebase Google Sign In
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // 2. Sync with Backend
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            login(data.user); // Update global state immediately
            router.refresh();
            if (!data.user.phone) {
                router.push('/complete-profile');
            } else if (data.user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } else {
            setError(data.error || "Login failed");
        }

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to sign in with Google");
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

        {/* Content */}
        <div className="p-8 pt-2">
            <div className="space-y-4">
                <Button 
                    onClick={handleGoogleLogin} 
                    disabled={loading} 
                    className="w-full h-12 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 relative"
                >
                    {loading ? (
                        "Signing in..."
                    ) : (
                        <>
                            <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </Button>
                
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md text-center">
                        {error}
                    </div>
                )}

                <p className="text-xs text-center text-slate-400">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}


