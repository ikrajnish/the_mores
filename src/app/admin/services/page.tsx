"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, PlusCircle, Search, Layers, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allPricing, setAllPricing] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]); // Derived or fetched
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [editAppt, setEditAppt] = useState<any>(null); // Service being edited
  const [isNew, setIsNew] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Fetch everything needed
  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch Services & Categories & Pricing
        const sRes = await fetch('/api/admin/services');
        const sData = await sRes.json();
        
        if (sData.services) setServices(sData.services);
        if (sData.categories) setCategories(sData.categories);
        if (sData.pricing) setAllPricing(sData.pricing);

        // Fetch Memberships for the Pricing Matrix columns
        const mRes = await fetch('/api/admin/memberships');
        const mData = await mRes.json();
        if (mData.memberships) setMemberships(mData.memberships);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this service?")) return;
      await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      fetchData();
  };

  const openAddModal = () => {
      setIsNew(true);
      setEditAppt({ name: "", duration: 30, categoryId: categories[0]?._id, price: 0, image: "", shortDescription: "" });
  };

  const openEditModal = (service: any) => {
      setIsNew(false);
      setEditAppt(service);
  };

  const filteredServices = services.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || s.categoryId?._id === categoryFilter || s.categoryId === categoryFilter;
      return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Services</h1>
                <p className="text-slate-500">Manage service offerings and pricing</p>
            </div>
            
            <div className="flex gap-2">
                <Button onClick={openAddModal} className="bg-slate-900 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Service
                </Button>
                <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
                    <Layers className="w-4 h-4 mr-2" /> Categories
                </Button>
                <Link href="/admin">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search services..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>
            <select 
                className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
                <ServiceAdminCard 
                    key={service._id} 
                    service={service} 
                    pricing={allPricing.filter((p: any) => p.serviceId === service._id)}
                    memberships={memberships}
                    onEdit={() => openEditModal(service)}
                    onDelete={() => handleDelete(service._id)}
                />
            ))}
        </div>

      </main>

      <ServiceModal 
        isOpen={!!editAppt} 
        onClose={() => setEditAppt(null)} 
        isNew={isNew} 
        service={editAppt}
        categories={categories}
        memberships={memberships}
        allPricing={allPricing}
        onSuccess={fetchData}
      />

      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        categories={categories}
        onSuccess={fetchData}
      />
      
      <Footer />
    </div>
  );
}

// ... ServiceAdminCard ...
// ... ServiceModal ...

function CategoryModal({ isOpen, onClose, categories, onSuccess }: any) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/services/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                onSuccess();
                setName("");
            } else {
                alert("Failed to add category");
            }
        } catch (e) {
            alert("Error adding category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                     <div className="flex gap-2">
                         <Input 
                            placeholder="New Category Name" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                         />
                         <Button onClick={handleAdd} disabled={loading}>Add</Button>
                     </div>
                     
                     <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                         {categories.map((c: any) => (
                             <div key={c._id} className="p-2 text-sm flex justify-between">
                                 <span>{c.name}</span>
                                 {/* Potential delete button here later */}
                             </div>
                         ))}
                     </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ServiceAdminCard({ service, pricing, memberships, onEdit, onDelete }: any) {
    // Find base price (usually NORMAL)
    const normalId = memberships.find((m: any) => m.name === 'NORMAL')?._id;
    const basePrice = pricing.find((p: any) => p.membershipId === normalId || p.membershipId?._id === normalId)?.price || 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                     {/* <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                         {service.image ? <img src={service.image} className="w-full h-full object-cover rounded-lg" /> : <Layers className="w-5 h-5 text-slate-400" />}
                     </div> */}
                     <div>
                         <h3 className="font-bold text-slate-900 line-clamp-1">{service.name}</h3>
                         <div className="text-xs text-slate-500 flex items-center gap-1">
                             <Layers className="w-3 h-3" /> {service.categoryId?.name || "Uncategorized"}
                         </div>
                     </div>
                </div>
                <Badge variant="outline">₹{basePrice}</Badge>
            </div>
            
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
                {service.shortDescription || "No description provided."}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {service.duration} min
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onEdit}>
                        <Edit2 className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50" onClick={onDelete}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ServiceModal({ isOpen, onClose, isNew, service, categories, memberships, allPricing, onSuccess }: any) {
    const [formData, setFormData] = useState<any>({});
    const [pricingMap, setPricingMap] = useState<any>({});
    const [tab, setTab] = useState<'DETAILS' | 'PRICING'>('DETAILS');

    useEffect(() => {
        if (service) {
            setFormData({ ...service });
            
            // Initialize pricing map
            const pMap: any = {};
            memberships.forEach((m: any) => {
                // Find existing price
                const validP = allPricing.find((p: any) => p.serviceId === service._id && (p.membershipId === m._id || p.membershipId?._id === m._id));
                pMap[m._id] = validP ? validP.price : 0;
            });
            setPricingMap(pMap);
        }
    }, [service, memberships, allPricing]);

    const handleSave = async () => {
        const pricingArray = Object.keys(pricingMap).map(mId => ({
            membershipId: mId,
            price: pricingMap[mId]
        }));

        const payload = {
            ...formData,
            pricing: pricingArray
        };

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? '/api/admin/services' : `/api/admin/services/${service._id}`;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        onSuccess();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{isNew ? "Add Service" : "Edit Service"}</DialogTitle></DialogHeader>
                
                <div className="flex gap-4 border-b border-slate-200 mb-4">
                    <button 
                        className={`pb-2 text-sm font-medium ${tab === 'DETAILS' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
                        onClick={() => setTab('DETAILS')}
                    >
                        Details
                    </button>
                    <button 
                         className={`pb-2 text-sm font-medium ${tab === 'PRICING' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
                         onClick={() => setTab('PRICING')}
                    >
                        Pricing Log
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                    {tab === 'DETAILS' ? (
                        <>
                             <div>
                                <label className="text-sm font-medium mb-1 block">Service Name</label>
                                <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Duration (min)</label>
                                    <Input type="number" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Category</label>
                                    <select 
                                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                        value={typeof formData.categoryId === 'object' ? formData.categoryId?._id : formData.categoryId} 
                                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c: any) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <Textarea value={formData.shortDescription || ''} onChange={e => setFormData({...formData, shortDescription: e.target.value})} />
                             </div>
                             <div>
                                <label className="text-sm font-medium mb-1 block">Image URL</label>
                                <Input value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                             </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 mb-2">Set custom prices for each membership tier.</p>
                            {memberships.map((m: any) => (
                                <div key={m._id} className="flex items-center justify-between border p-2 rounded-md bg-slate-50">
                                    <span className="font-medium text-sm">{m.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-xs">₹</span>
                                        <Input 
                                            type="number" 
                                            className="w-24 h-8 bg-white"
                                            value={pricingMap[m._id]} 
                                            onChange={e => setPricingMap({...pricingMap, [m._id]: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleSave}>Save Service</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
