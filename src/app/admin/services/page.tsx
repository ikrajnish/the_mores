"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, PlusCircle, Search, Layers, Clock, Grid, ChevronRight, ArrowLeft, FolderPlus, Folder } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type ViewMode = 'CATEGORIES' | 'SUBCATEGORIES' | 'SERVICES';

export default function AdminServicesPage() {
  // Data
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  
  // Lookup Data (for modals/pricing)
  const [allPricing, setAllPricing] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('CATEGORIES');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);

  // Modals & FormsState
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  
  const [editItem, setEditItem] = useState<any>(null); // For Category/Subcategory editing
  const [isEditing, setIsEditing] = useState(false); // Flag to differentiate Add vs Edit

  const [editAppt, setEditAppt] = useState<any>(null); // Service being edited
  const [isNewService, setIsNewService] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  const fetchData = async () => {
    setLoading(true);
    try {
        const [cRes, mRes, sRes] = await Promise.all([
            fetch('/api/admin/categories'),
            fetch('/api/admin/memberships'),
            fetch('/api/admin/services') // Needed for pricing lookup later, or we can fetch partially
        ]);

        const cData = await cRes.json();
        const mData = await mRes.json();
        const sData = await sRes.json();

        if (cData.categories) setCategories(cData.categories);
        if (mData.memberships) setMemberships(mData.memberships);
        if (sData.pricing) setAllPricing(sData.pricing);

    } catch (e) {
        console.error("Error fetching initial data", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);

  // Fetch Subcategories when Category is selected
  useEffect(() => {
      if (selectedCategory) {
          fetch(`/api/admin/subcategories?categoryId=${selectedCategory._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.subcategories) setSubcategories(data.subcategories);
            });
      }
  }, [selectedCategory]);

  // Fetch Services when Subcategory is selected
  useEffect(() => {
    if (selectedSubcategory) {
        // We can either filter from a global list or fetch specific.
        // Let's filter from global for now since we fetched all services for pricing lookup anyway.
        // OR fetch fresh to ensure we have latest.
        fetch(`/api/admin/services`)
          .then(res => res.json())
          .then(data => {
              if (data.services) {
                  const filtered = data.services.filter((s:any) => 
                      s.subcategory?._id === selectedSubcategory._id || s.subcategory === selectedSubcategory._id
                  );
                  setServices(filtered);
              }
              if (data.pricing) setAllPricing(data.pricing);
          });
    }
  }, [selectedSubcategory]);

  const handleCategoryClick = (cat: any) => {
      setSelectedCategory(cat);
      setViewMode('SUBCATEGORIES');
  };

  const handleSubcategoryClick = (sub: any) => {
      setSelectedSubcategory(sub);
      setViewMode('SERVICES');
  };

  const handleBack = () => {
      if (viewMode === 'SERVICES') {
          setViewMode('SUBCATEGORIES');
          setSelectedSubcategory(null);
          setServices([]);
      } else if (viewMode === 'SUBCATEGORIES') {
          setViewMode('CATEGORIES');
          setSelectedCategory(null);
          setSubcategories([]);
      }
  };

  const handleCreateOrUpdateCategory = async (name: string, image: string) => {
      if (isEditing && editItem) {
          // Update
           const res = await fetch(`/api/admin/categories/${editItem._id}`, {
              method: 'PUT',
              body: JSON.stringify({ name, image }),
              headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
              fetchData();
              setCategoryModalOpen(false);
              setEditItem(null);
          } else {
              alert("Failed to update category");
          }
      } else {
          // Create
          const res = await fetch('/api/admin/categories', {
              method: 'POST',
              body: JSON.stringify({ name, image }),
              headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
              fetchData();
              setCategoryModalOpen(false);
          } else {
              alert("Failed to create category");
          }
      }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this category?")) return;
      
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
          fetchData();
      } else {
          alert(data.error || "Failed to delete category");
      }
  };

  const handleCreateOrUpdateSubcategory = async (name: string, image: string) => {
      if (isEditing && editItem) {
          // Update
          const res = await fetch(`/api/admin/subcategories/${editItem._id}`, {
              method: 'PUT',
              body: JSON.stringify({ name, image }),
              headers: { 'Content-Type': 'application/json' }
          });
           if (res.ok) {
             const updated = await fetch(`/api/admin/subcategories?categoryId=${selectedCategory._id}`).then(r => r.json());
             setSubcategories(updated.subcategories);
             setSubcategoryModalOpen(false);
             setEditItem(null);
          } else {
              alert("Failed to update subcategory");
          }
      } else {
          // Create
          if (!selectedCategory) return;
          const res = await fetch('/api/admin/subcategories', {
              method: 'POST',
              body: JSON.stringify({ name, categoryId: selectedCategory._id, image }),
              headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
             const updated = await fetch(`/api/admin/subcategories?categoryId=${selectedCategory._id}`).then(r => r.json());
             setSubcategories(updated.subcategories);
             setSubcategoryModalOpen(false);
          } else {
              alert("Failed to create subcategory");
          }
      }
  };

  const handleDeleteSubcategory = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this subcategory?")) return;

      const res = await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' });
      const data = await res.json();

       if (res.ok) {
             const updated = await fetch(`/api/admin/subcategories?categoryId=${selectedCategory._id}`).then(r => r.json());
             setSubcategories(updated.subcategories);
      } else {
          alert(data.error || "Failed to delete subcategory");
      }
  };

  // Helper to open Add/Edit Modals
  const openCategoryModal = (category?: any) => {
      if (category) {
          setIsEditing(true);
          setEditItem(category);
      } else {
          setIsEditing(false);
          setEditItem(null);
      }
      setCategoryModalOpen(true);
  };

  const openSubcategoryModal = (subcategory?: any) => {
      if (subcategory) {
           setIsEditing(true);
           setEditItem(subcategory);
      } else {
           setIsEditing(false);
           setEditItem(null);
      }
      setSubcategoryModalOpen(true);
  };

  const openAddServiceModal = () => {
      setIsNewService(true);
      setEditAppt({
          name: "",
          duration: 30,
          categoryId: selectedCategory._id,
          subcategory: selectedSubcategory._id,
          price: 0,
          image: "",
          shortDescription: ""
      });
      setServiceModalOpen(true);
  };

  const openEditServiceModal = (service: any) => {
      setIsNewService(false);
      setEditAppt(service);
      setServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
      if (!confirm("Are you sure?")) return;
      await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      // Refresh local list
      const updated = services.filter(s => s._id !== id);
      setServices(updated);
  };

  const handleServiceSuccess = () => {
      // Re-fetch services for this subcategory
       fetch(`/api/admin/services`)
          .then(res => res.json())
          .then(data => {
              if (data.services) {
                  const filtered = data.services.filter((s:any) => 
                      s.subcategory?._id === selectedSubcategory._id || s.subcategory === selectedSubcategory._id
                  );
                  setServices(filtered);
              }
              if (data.pricing) setAllPricing(data.pricing);
          });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
                {viewMode !== 'CATEGORIES' && (
                    <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                        <ArrowLeft className="w-5 h-5 text-slate-50" />
                    </Button>
                )}
                <div>
                   <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-2">
                       {viewMode === 'CATEGORIES' && 'Service Categories'}
                       {viewMode === 'SUBCATEGORIES' && selectedCategory?.name}
                       {viewMode === 'SERVICES' && selectedSubcategory?.name}
                   </h1>
                   <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                       <span className={viewMode === 'CATEGORIES' ? "font-bold text-slate-50" : ""}>Categories</span>
                       {viewMode !== 'CATEGORIES' && (
                           <>
                                <ChevronRight className="w-4 h-4" />
                                <span className={viewMode === 'SUBCATEGORIES' ? "font-bold text-slate-50" : ""}>
                                    {selectedCategory?.name}
                                </span>
                           </>
                       )}
                       {viewMode === 'SERVICES' && (
                           <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-bold text-slate-900">{selectedSubcategory?.name}</span>
                           </>
                       )}
                   </div>
                </div>
            </div>
            
            <div className="flex gap-2">
                {viewMode === 'CATEGORIES' && (
                    <Button onClick={() => openCategoryModal()} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Category
                    </Button>
                )}
                {viewMode === 'SUBCATEGORIES' && (
                     <Button onClick={() => openSubcategoryModal()} className="bg-slate-900 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Subcategory
                    </Button>
                )}
                {viewMode === 'SERVICES' && (
                    <Button onClick={openAddServiceModal} className="bg-slate-900 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Service
                    </Button>
                )}
                 <Link href="/admin">
                     <Button variant="outline" className="text-white border-slate-700 bg-slate-800 hover:bg-slate-900">Dashboard</Button>
                </Link>
            </div>
        </div>

        {/* Content Area */}
        {loading ? (
             <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : (
            <>
                {/* 1. Categories Grid */}
                {viewMode === 'CATEGORIES' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <div 
                                key={cat._id} 
                                onClick={() => handleCategoryClick(cat)}
                                className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer group"
                            >
                                {cat.image ? (
                                    <div className="w-12 h-12 rounded-lg mb-4 overflow-hidden bg-slate-100">
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                        <Layers className="w-6 h-6 text-purple-600" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-50 mb-1 group-hover:text-purple-400">{cat.name}</h3>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                         <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-slate-700 hover:text-white" onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }}>
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                         </Button>
                                         <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={(e) => handleDeleteCategory(e, cat._id)}>
                                            <Trash2 className="w-3 h-3" />
                                         </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Click to manage subcategories</p>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                                No categories found. Create one to get started.
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Subcategories Grid */}
                {viewMode === 'SUBCATEGORIES' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                         {subcategories.map((sub) => (
                            <div 
                                key={sub._id} 
                                onClick={() => handleSubcategoryClick(sub)}
                                className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
                            >
                                {sub.image ? (
                                    <div className="w-12 h-12 rounded-lg mb-4 overflow-hidden bg-slate-100">
                                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                        <Grid className="w-6 h-6 text-blue-600" />
                                    </div>
                                )}
                                 <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-50 mb-1 group-hover:text-blue-400">{sub.name}</h3>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                         <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-slate-700 hover:text-white" onClick={(e) => { e.stopPropagation(); openSubcategoryModal(sub); }}>
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                         </Button>
                                         <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={(e) => handleDeleteSubcategory(e, sub._id)}>
                                            <Trash2 className="w-3 h-3" />
                                         </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Click to view services</p>
                            </div>
                        ))}
                         {subcategories.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                                No subcategories found in {selectedCategory?.name}.
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Services Grid */}
                {viewMode === 'SERVICES' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <ServiceAdminCard 
                                key={service._id} 
                                service={service} 
                                pricing={allPricing.filter((p: any) => p.serviceId === service._id)}
                                memberships={memberships}
                                onEdit={() => openEditServiceModal(service)}
                                onDelete={() => handleDeleteService(service._id)}
                            />
                        ))}
                         {services.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                                No services found in {selectedSubcategory?.name}.
                            </div>
                        )}
                    </div>
                )}
            </>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <SimpleNameModal 
        isOpen={categoryModalOpen} 
        onClose={() => setCategoryModalOpen(false)} 
        title={isEditing ? "Edit Category" : "Add Category"} 
        onSave={handleCreateOrUpdateCategory} 
        initialData={isEditing ? editItem : null}
      />

       <SimpleNameModal 
        isOpen={subcategoryModalOpen} 
        onClose={() => setSubcategoryModalOpen(false)} 
        title={isEditing ? "Edit Subcategory" : `Add Subcategory to ${selectedCategory?.name}`}
        onSave={handleCreateOrUpdateSubcategory} 
        initialData={isEditing ? editItem : null}
      />

      <ServiceModal 
        isOpen={serviceModalOpen} 
        onClose={() => setServiceModalOpen(false)} 
        isNew={isNewService} 
        service={editAppt}
        categories={categories} // Still pass all just in case, but form should lock it
        allSubcategories={subcategories} // Pass current context subcats
        memberships={memberships}
        allPricing={allPricing}
        onSuccess={handleServiceSuccess}
        fixedCategory={selectedCategory}
        fixedSubcategory={selectedSubcategory}
      />

    </div>
  );
}

// --- Sub Components ---

function SimpleNameModal({ isOpen, onClose, title, onSave, initialData }: any) {
    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setImage(initialData.image || "");
            } else {
                setName("");
                setImage("");
            }
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!name) return;
        onSave(name, image);
        if (!initialData) {
            setName("");
            setImage("");
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-slate-800 border-slate-700">
                <DialogHeader><DialogTitle className="text-slate-50">{title}</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block text-slate-300">Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name..." className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block text-slate-300">Image URL (Optional)</label>
                        <Input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="bg-slate-100 text-slate-900 hover:bg-slate-200">{initialData ? "Update" : "Create"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ServiceAdminCard({ service, pricing, memberships, onEdit, onDelete }: any) {
    const normalId = memberships.find((m: any) => m.name === 'NORMAL')?._id;
    const basePrice = pricing.find((p: any) => p.membershipId === normalId || p.membershipId?._id === normalId)?.price || 0;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                     {service.image && (
                         <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                         </div>
                     )}
                     <div>
                         <h3 className="font-bold text-slate-50 line-clamp-1">{service.name}</h3>
                         <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                             <span className="flex items-center gap-1 bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                                <Clock className="w-3 h-3" /> {service.duration} min
                             </span>
                         </div>
                     </div>
                </div>
                <Badge variant="outline" className="text-slate-300 border-slate-600">₹{basePrice}</Badge>
            </div>
            
            <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                {service.shortDescription || "No description provided."}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-700 hover:text-white" onClick={onEdit}>
                    <Edit2 className="w-4 h-4 text-slate-400" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </div>
    )
}

function ServiceModal({ isOpen, onClose, isNew, service, categories, allSubcategories, memberships, allPricing, onSuccess, fixedCategory, fixedSubcategory }: any) {
    const [formData, setFormData] = useState<any>({});
    const [pricingMap, setPricingMap] = useState<any>({});
    const [tab, setTab] = useState<'DETAILS' | 'PRICING'>('DETAILS');

    // If we are in fixed context, use that.
    useEffect(() => {
        if (isOpen) {
             const initialData = service ? { 
                 ...service,
                categoryId: typeof service.categoryId === 'object' ? service.categoryId?._id : service.categoryId,
                subcategory: typeof service.subcategory === 'object' ? service.subcategory?._id : service.subcategory
             } : {
                 name: "", 
                 duration: 30, 
                 categoryId: fixedCategory?._id, 
                 subcategory: fixedSubcategory?._id,
                 price: 0, 
                 image: "", 
                 shortDescription: "" 
             };
             
             setFormData(initialData);

             // Pricing
             const pMap: any = {};
             if (service) {
                memberships.forEach((m: any) => {
                    const validP = allPricing.find((p: any) => p.serviceId === service._id && (p.membershipId === m._id || p.membershipId?._id === m._id));
                    pMap[m._id] = validP ? validP.price : 0;
                });
             } else {
                 // Initialize 0
                 memberships.forEach((m: any) => pMap[m._id] = 0);
             }
             setPricingMap(pMap);
        }
    }, [isOpen, service, fixedCategory, fixedSubcategory, memberships, allPricing]);

    const handleSave = async () => {
        if (!formData.name || !formData.categoryId || !formData.subcategory) {
            alert("Name, Category, and Subcategory are required");
            return;
        }

        const pricingArray = Object.keys(pricingMap).map(mId => ({
            membershipId: mId,
            price: Number(pricingMap[mId])
        }));

        const payload = {
            ...formData,
            pricing: pricingArray
        };

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? '/api/admin/services' : `/api/admin/services/${service?._id}`;

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
            <DialogContent className="max-w-md bg-slate-800 border-slate-700">
                <DialogHeader><DialogTitle className="text-slate-50">{isNew ? "Add Service" : "Edit Service"}</DialogTitle></DialogHeader>
                
                <div className="flex gap-4 border-b border-slate-700 mb-4">
                    <button 
                        className={`pb-2 text-sm font-medium ${tab === 'DETAILS' ? 'text-slate-50 border-b-2 border-slate-50' : 'text-slate-500'}`}
                        onClick={() => setTab('DETAILS')}
                    >
                        Details
                    </button>
                    <button 
                         className={`pb-2 text-sm font-medium ${tab === 'PRICING' ? 'text-slate-50 border-b-2 border-slate-50' : 'text-slate-500'}`}
                         onClick={() => setTab('PRICING')}
                    >
                         Pricing Log
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                    {tab === 'DETAILS' ? (
                        <>
                             <div>
                                <label className="text-sm font-medium mb-1 block text-slate-300">Service Name</label>
                                <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-900 border-slate-700 text-slate-50" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block text-slate-300">Duration (min)</label>
                                    <Input type="number" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="bg-slate-900 border-slate-700 text-slate-50" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block text-slate-300">Category</label>
                                    <Input disabled value={fixedCategory?.name || "Loading..."} className="bg-slate-900/50 border-slate-700 text-slate-400" />
                                </div>
                             </div>
                             
                             {/* Subcategory Selector */}
                             <div>
                                <label className="text-sm font-medium mb-1 block text-slate-300">Subcategory</label>
                                <Input disabled value={fixedSubcategory?.name || "Loading..."} className="bg-slate-900/50 border-slate-700 text-slate-400" />
                             </div>

                             <div>
                                <label className="text-sm font-medium mb-1 block text-slate-300">Description</label>
                                <Textarea 
                                    className="bg-slate-900 text-slate-50 border-slate-700 focus:border-slate-500"
                                    value={formData.shortDescription || ''} 
                                    onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                                />
                             </div>
                             <div>
                                <label className="text-sm font-medium mb-1 block text-slate-300">Image URL</label>
                                <Input value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="bg-slate-900 border-slate-700 text-slate-50" />
                             </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 mb-2">Set custom prices for each membership tier.</p>
                            {memberships.map((m: any) => (
                                <div key={m._id} className="flex items-center justify-between border border-slate-700 p-2 rounded-md bg-slate-900">
                                    <span className="font-medium text-sm text-slate-300">{m.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-xs">₹</span>
                                        <Input 
                                            type="number" 
                                            className="w-24 h-8 bg-slate-800 border-slate-600 text-slate-50"
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
                    <Button onClick={handleSave} className="bg-slate-100 text-slate-900 hover:bg-slate-200">Save Service</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
