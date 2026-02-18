
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="rounded-full bg-slate-200 p-4">
        <FileQuestion className="h-8 w-8 text-slate-600" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h2>
      <p className="mt-2 text-slate-600 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
