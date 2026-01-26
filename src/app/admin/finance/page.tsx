"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminFinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/finance')
      .then(res => res.json())
      .then(data => {
          if (!data.error) setData(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
     fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-50">Finance & Revenue</h1>
                <p className="text-slate-100">Track earnings, memberships, and expenses</p>
            </div>
            
            <div className="flex gap-2">
                <Button onClick={() => setIsExpenseModalOpen(true)}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Expense
                </Button>
                <Link href="/admin">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        </div>

        {loading || !data ? (
             <div className="p-8 text-center text-slate-500">Loading financial data...</div>
        ) : (
            <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{data.summary.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Services + Products + Memberships</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{data.summary.netProfit.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">After deducting ₹{data.summary.totalExpenses.toLocaleString()} expenses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">₹{data.summary.totalExpenses.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Manual entries</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Revenue Breakdown (Last 7 Days)</CardTitle>
                            <CardDescription>Daily earnings from services vs memberships vs expenses</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Legend />
                                    <Bar dataKey="services" name="Services" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="memberships" name="Memberships" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="products" name="Products" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 4, 4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    
                    {/* Recent Transactions List */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest financial activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {data.recentTransactions.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8">No recent transactions</div>
                                ) : (
                                    data.recentTransactions.map((t: any) => (
                                        <div key={t._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-medium text-sm">{t.description}</div>
                                                <div className="text-xs text-slate-500">{format(new Date(t.date), 'MMM d, yyyy h:mm a')}</div>
                                            </div>
                                            <div className={`font-bold text-sm ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {t.type === 'EXPENSE' ? '-' : '+'}₹{t.amount}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}

      </main>

      <AddExpenseModal open={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSuccess={fetchData} />
      
      <Footer />
    </div>
  );
}

function AddExpenseModal({ open, onClose, onSuccess }: any) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!amount || !description) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description, date })
            });
            if (res.ok) {
                onSuccess();
                onClose();
                setAmount("");
                setDescription("");
            } else {
                alert("Failed to add expense");
            }
        } catch (e) {
            alert("Error adding expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
             <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader><DialogTitle className="text-slate-50">Add Expense</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                     <div>
                        <label className="text-sm font-medium mb-1 block text-slate-400">Description</label>
                        <Input 
                            placeholder="e.g., Office Supplies, Rent, Salaries" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                        />
                     </div>
                     <div>
                        <label className="text-sm font-medium mb-1 block text-slate-400">Amount (₹)</label>
                        <Input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                        />
                     </div>
                     <div>
                        <label className="text-sm font-medium mb-1 block text-slate-400">Date</label>
                        <Input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                        />
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white border-0">
                        {loading ? "Adding..." : "Add Expense"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
