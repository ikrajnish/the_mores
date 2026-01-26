"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit2, Trash2, PlusCircle, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This might affect services linked to this category.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const handleOpenModal = (category?: any) => {
      setEditingCategory(category || null);
      setFormData({ name: category?.name || "" });
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!formData.name) return;
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/admin/categories/${editingCategory._id}` : '/api/admin/categories';
      
      const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      });
      
      if (res.ok) {
          setIsModalOpen(false);
          fetchCategories();
      } else {
          alert("Error saving category");
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
                <p className="text-slate-500">Manage separate service categories</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => handleOpenModal()} className="bg-slate-900 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Category
                </Button>
                <Link href="/admin/services">
                    <Button variant="outline">Back to Services</Button>
                </Link>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
                {categories.map((category) => (
                    <div key={category._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                <Layers className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-slate-900">{category.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleOpenModal(category)}>
                                <Edit2 className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(category._id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-500">No categories found.</div>
                )}
            </div>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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
