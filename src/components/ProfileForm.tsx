"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
  });

  const handleSave = async () => {
     setLoading(true);
     try {
         const res = await fetch("/api/user/profile", {
             method: "PUT",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(formData),
         });
         
         if (res.ok) {
             setEditing(false);
             router.refresh();
         } else {
             alert("Failed to update profile");
         }
     } catch (e) {
         console.error(e);
         alert("Error saving profile");
     } finally {
         setLoading(false);
     }
  };

  return (
    <div className="space-y-4">
       <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
          <div className="text-gray-900 font-medium">{user.phone}</div>
       </div>

       <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
          {editing ? (
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your name"
                className="mt-1"
              />
          ) : (
              <div className="text-gray-900 font-medium">{user.name || "Not set"}</div>
          )}
       </div>

       <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
          {editing ? (
              <Input 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                className="mt-1"
              />
          ) : (
              <div className="text-gray-900 font-medium">{user.email || "Not set"}</div>
          )}
       </div>

       <div className="pt-2">
           {editing ? (
               <div className="flex gap-2">
                   <Button size="sm" onClick={handleSave} disabled={loading}>
                       {loading && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                       Save
                   </Button>
                   <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={loading}>
                       Cancel
                   </Button>
               </div>
           ) : (
               <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                   Edit Profile
               </Button>
           )}
       </div>
    </div>
  );
}
