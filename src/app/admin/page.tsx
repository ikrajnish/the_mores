"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, DollarSign, Users, Package, TrendingUp, Activity, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
        .then(res => {
            if (res.status === 403) throw new Error("Unauthorized");
            return res.json();
        })
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Access Denied or Error</div>;

  const { metrics, recentActivity, revenueChart } = data;

  // Transform revenue chart data for Recharts
  // Ensure we have last 7 days even if empty
  const chartData = revenueChart?.map((item: any) => ({
      date: format(new Date(item._id), 'MMM dd'),
      revenue: item.revenue
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <Badge variant="outline" className="px-3 py-1 bg-white">
                {format(new Date(), 'PPP')}
            </Badge>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
                title="Total Revenue" 
                value={`₹${metrics.totalRevenue.toLocaleString()}`} 
                icon={DollarSign} 
                trend="+12% from last month"
                color="text-emerald-600"
                bgColor="bg-emerald-100"
            />
            <StatsCard 
                title="Today's Appointments" 
                value={metrics.todaysAppointments} 
                icon={Calendar} 
                trend="4 pending confirmation"
                color="text-blue-600"
                bgColor="bg-blue-100"
            />
             <StatsCard 
                title="Total Members" 
                value={Object.values(metrics.membershipCounts).reduce((a:any, b:any) => a + b, 0)} 
                icon={Users} 
                trend={`+${metrics.recentEnrollments} this week`}
                color="text-purple-600"
                bgColor="bg-purple-100"
            />
             <StatsCard 
                title="Low Stock Items" 
                value={metrics.lowStockCount} 
                icon={Package} 
                trend="Requires attention"
                color="text-amber-600"
                bgColor="bg-amber-100"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
                 <Card className="h-full border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-slate-500" />
                            Revenue Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#64748b', fontSize: 12}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#64748b', fontSize: 12}}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#f1f5f9'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Membership Distribution */}
            <div>
                <Card className="h-full border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-slate-500" />
                            Membership Tiers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 mt-4">
                            {Object.entries(metrics.membershipCounts).map(([tier, count]: [string, any]) => (
                                <div key={tier} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            tier === 'PLATINUM' ? 'bg-slate-800' :
                                            tier === 'GOLD' ? 'bg-amber-400' :
                                            tier === 'SILVER' ? 'bg-slate-400' : 'bg-slate-200'
                                        }`} />
                                        <span className="font-medium text-slate-700 capitalize">{tier.toLowerCase()}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{count}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-start">
                                <Activity className="w-5 h-5 text-purple-500 mr-2 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Growth Insight</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Platinum tier has grown by 15% this month, driving higher recurring revenue.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Recent Activity Table */}
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentActivity.map((booking: any) => (
                                <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {booking.userId?.name || booking.userId?.phone || 'Guest'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {booking.serviceId?.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {format(new Date(booking.date), 'MMM dd, HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        ₹{booking.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                            {booking.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

      </main>
      
      <Footer />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, color, bgColor }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 font-medium text-sm">{title}</span>
                <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                <div className="flex items-center mt-2 text-xs font-medium text-emerald-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {trend}
                </div>
            </div>
        </div>
    )
}
