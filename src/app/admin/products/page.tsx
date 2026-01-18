"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Package, ClipboardList, TrendingUp, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Products & Inventory</h1>
                <p className="text-slate-500">Manage products, stock, and user requests</p>
            </div>
            
            <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
            </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
            <button
                onClick={() => setActiveTab('inventory')}
                className={`pb-4 px-6 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === 'inventory'
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
            >
                <Package className="w-4 h-4" /> Inventory
            </button>
            <button
                onClick={() => setActiveTab('requests')}
                className={`pb-4 px-6 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === 'requests'
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
            >
                <ClipboardList className="w-4 h-4" /> Requests
            </button>
        </div>

        {activeTab === 'inventory' ? <InventoryTab /> : <RequestsTab />}

      </main>
      
      <Footer />
    </div>
  );
}

function InventoryTab() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (data.products) setProducts(data.products);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        fetchProducts();
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Product List</h2>
                <Button onClick={() => { setEditingProduct(null); setIsAddOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map(product => (
                            <tr key={product._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                                <td className="px-6 py-4">₹{product.price}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                                        {product.stock} in stock
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => { setEditingProduct(product); setIsAddOpen(true); }}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(product._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <ProductModal 
                isOpen={isAddOpen} 
                onClose={() => setIsAddOpen(false)} 
                product={editingProduct} 
                onSuccess={() => { setIsAddOpen(false); fetchProducts(); }} 
            />
        </div>
    );
}

function ProductModal({ isOpen, onClose, product, onSuccess }: any) {
    const [formData, setFormData] = useState({ name: '', price: 0, stock: 0, description: '', image: '' });

    useEffect(() => {
        if (product) {
            setFormData({ 
                name: product.name, 
                price: product.price, 
                stock: product.stock, 
                description: product.description || '',
                image: product.image || ''
            });
        } else {
            setFormData({ name: '', price: 0, stock: 0, description: '', image: '' });
        }
    }, [product, isOpen]);

    const handleSubmit = async () => {
        const url = product ? `/api/admin/products/${product._id}` : '/api/admin/products';
        const method = product ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Price</label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Stock</label>
                            <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Image URL</label>
                        <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Product</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RequestsTab() {
    const [requests, setRequests] = useState<any[]>([]);
    
    const fetchRequests = () => {
        fetch('/api/admin/product-requests')
            .then(res => res.json())
            .then(data => {
                if (data.requests) setRequests(data.requests);
            });
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        await fetch('/api/admin/product-requests', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        fetchRequests();
    };

    return (
        <div>
             <h2 className="text-xl font-semibold mb-4">Product Requests</h2>
             <div className="grid gap-4">
                 {requests.map(req => (
                     <div key={req._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                         <div>
                             <h3 className="font-semibold text-slate-900">{req.productId?.name || "Unknown Product"}</h3>
                             <div className="text-sm text-slate-500">
                                 Request by: <span className="font-medium text-slate-700">{req.userPhone}</span>
                                 {req.userId?.name && ` (${req.userId.name})`}
                             </div>
                             <div className="text-xs text-slate-400 mt-1">
                                 {format(new Date(req.createdAt), 'PPP p')}
                             </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <Badge variant={req.status === 'FULFILLED' ? 'default' : 'secondary'}>
                                 {req.status}
                             </Badge>
                             {req.status === 'PENDING' && (
                                 <Button size="sm" onClick={() => updateStatus(req._id, 'FULFILLED')}>
                                     Mark Fulfilled
                                 </Button>
                             )}
                         </div>
                     </div>
                 ))}
                 {requests.length === 0 && <div className="text-center text-slate-500 py-8">No requests found.</div>}
             </div>
        </div>
    );
}
