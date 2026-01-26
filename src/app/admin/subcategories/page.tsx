"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit2, Trash2, PlusCircle, Grid, Filter } from "lucide-react";
import Link from "next/link";

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("ALL");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", categoryId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
        const [subRes, catRes] = await Promise.all([
            fetch(`/api/admin/subcategories${filterCat !== 'ALL' ? `?categoryId=${filterCat}` : ''}`),
            fetch('/api/admin/categories')
        ]);
        
        const subData = await subRes.json();
        const catData = await catRes.json();

        if (subData.subcategories) setSubcategories(subData.subcategories);
        if (catData.categories) setCategories(catData.categories);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCat]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleOpenModal = (sub?: any) => {
      setEditingSub(sub || null);
      setFormData({ 
          name: sub?.name || "", 
          categoryId: sub?.categoryId?._id || sub?.categoryId || (filterCat !== 'ALL' ? filterCat : categories[0]?._id) || "" 
      });
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!formData.name || !formData.categoryId) return;
      const method = editingSub ? 'PUT' : 'POST';
      const url = editingSub ? `/api/admin/subcategories/${editingSub._id}` : '/api/admin/subcategories';
      
      const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      });
      
      if (res.ok) {
          setIsModalOpen(false);
          fetchData();
      } else {
          alert("Error saving subcategory");
      }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Subcategories</h1>
                <p className="text-slate-500">Manage sub-groupings for services</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => handleOpenModal()} className="bg-slate-900 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Subcategory
                </Button>
                <Link href="/admin/services">
                    <Button variant="outline">Back to Services</Button>
                </Link>
            </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
             <Filter className="w-4 h-4 text-slate-400" />
             <select 
                className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 min-w-[200px]"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
            >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
                {subcategories.map((sub) => (
                    <div key={sub._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                <Grid className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-medium text-slate-900 block">{sub.name}</span>
                                <span className="text-xs text-slate-500">{sub.categoryId?.name || "Unknown Category"}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleOpenModal(sub)}>
                                <Edit2 className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(sub._id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
                {subcategories.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-500">No subcategories found.</div>
                )}
            </div>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingSub ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select 
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
