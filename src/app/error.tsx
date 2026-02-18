"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="rounded-full bg-red-100 p-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">Something went wrong!</h2>
      <p className="mt-2 text-slate-600 max-w-md">
        We apologize for the inconvenience. Our team has been notified.
      </p>
      
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="outline">
          Go Home
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 max-w-2xl overflow-auto rounded-lg bg-slate-900 p-4 text-left text-xs text-slate-200">
           <pre>{error.message}</pre>
           <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
