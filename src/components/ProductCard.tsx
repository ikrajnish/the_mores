"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProductCardProps {
  id: string;
  name: string;
  image?: string;
  price: number;
  brand?: string;
  description?: string;
}

export function ProductCard({ id, name, image, price, brand, description }: ProductCardProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Sync phone when user loads
  useState(() => {
     if (user?.phone) setPhone(user.phone);
  });

  // Also catch updates
  if (user?.phone && !phone) {
      // This is still risky in render, let's use useEffect properly
  }

  const handleRequest = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           productId: id,
           userPhone: phone
        }),
      });

      if (res.ok) {
        setRequestSent(true);
        setTimeout(() => {
            setOpen(false);
            setRequestSent(false); // Reset for next time
        }, 2000);
      } else {
        alert("Failed to send request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
            {brand && <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">{brand}</span>}
            <h3 className="font-bold text-gray-900 line-clamp-2">{name}</h3>
        </div>
        
        <p className="mb-4 text-xs text-gray-500 line-clamp-2 flex-grow">
          {description || "No description available."}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString()}</span>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
                    <ShoppingBag className="h-4 w-4" />
                    Request
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Product</DialogTitle>
                <DialogDescription>
                  Interested in {name}? Enter your phone number and we'll contact you to arrange purchase/delivery.
                </DialogDescription>
              </DialogHeader>
              
              {!requestSent ? (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                        <Input 
                            id="phone" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9999999999"
                            defaultValue={user?.phone}
                        />
                    </div>
                  </div>
              ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-green-600 gap-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6" />
                      </div>
                      <p className="font-medium">Request Sent Successfully!</p>
                      <p className="text-xs text-gray-500">We will contact you shortly.</p>
                  </div>
              )}

              {!requestSent && (
                <DialogFooter>
                    <Button onClick={handleRequest} disabled={loading || !phone.length}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Send Request"
                    )}
                    </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
