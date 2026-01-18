"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Image as ImageIcon, Video } from "lucide-react";
import Link from "next/link";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Item State
  const [mediaUrl, setMediaUrl] = useState("");
  const [type, setType] = useState<"image" | "video">("image");

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/admin/gallery')
      .then(res => res.json())
      .then(data => {
          if (data.items) setItems(data.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
     fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
      if (!confirm("Delete this item?")) return;
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      fetchItems();
  };

  const handleAdd = async () => {
      const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaUrl, type })
      });
      if (res.ok) {
          setIsAddOpen(false);
          setMediaUrl("");
          fetchItems();
      } else {
          alert("Failed to add item");
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gallery Management</h1>
                <p className="text-slate-500">Add or remove images and videos from the portfolio</p>
            </div>
            
            <div className="flex gap-2">
                 <Link href="/admin">
                     <Button variant="outline">Back</Button>
                 </Link>
                 <Button onClick={() => setIsAddOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                     <Plus className="w-4 h-4 mr-2" /> Add Media
                 </Button>
            </div>
        </div>

        {loading ? (
             <div className="p-8 text-center text-slate-500">Loading gallery...</div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div key={item._id} className="group relative aspect-square bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        {item.type === 'image' ? (
                            <img src={item.mediaUrl} alt="Gallery Item" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                <Video className="w-8 h-8" />
                            </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleDelete(item._id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                             {item.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                             <span className="capitalize">{item.type}</span>
                        </div>
                    </div>
                ))}
                
                {/* Empty State */}
                {items.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No items in gallery. Add some!</p>
                    </div>
                )}
            </div>
        )}

      </main>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Add Media</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                  <div>
                      <label className="text-sm font-medium mb-1 block">Media URL</label>
                      <Input 
                        placeholder="https://images.unsplash.com/..." 
                        value={mediaUrl} 
                        onChange={(e) => setMediaUrl(e.target.value)} 
                      />
                      <p className="text-xs text-slate-400 mt-1">Paste a valid image URL.</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <div className="flex gap-4">
                          <label className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer ${type === 'image' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200'}`}>
                              <input type="radio" className="hidden" checked={type === 'image'} onChange={() => setType('image')} />
                              <ImageIcon className="w-4 h-4" /> Image
                          </label>
                          <label className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer ${type === 'video' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200'}`}>
                              <input type="radio" className="hidden" checked={type === 'video'} onChange={() => setType('video')} />
                              <Video className="w-4 h-4" /> Video
                          </label>
                      </div>
                  </div>
              </div>
              <DialogFooter>
                  <Button onClick={handleAdd} disabled={!mediaUrl}>Add Item</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
