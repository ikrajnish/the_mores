"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, DollarSign, Users, Package, TrendingUp, Activity, ArrowUpRight, Loader2, AlertTriangle } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { AnalyticsResponseDTO } from "@/types";

// Faster fetcher with error handling
const fetcher = (url: string) => fetch(url).then(async (res) => {
    if (!res.ok) {
        if (res.status === 403) throw new Error("Unauthorized");
        throw new Error("Failed to fetch data");
    }
    return res.json();
});

export default function AdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsResponseDTO>(
      "/api/admin/analytics", 
      fetcher,
      {
          refreshInterval: 60000, // Refresh every minute
          revalidateOnFocus: true
      }
  );

  const { metrics, recentActivity, revenueChart } = data || {};

  const chartData = useMemo(() => {
      return revenueChart?.map((item) => ({
          date: format(new Date(item._id), 'MMM dd'),
          revenue: item.revenue
      })) || [];
  }, [revenueChart]);

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-slate-500 font-medium">Loading Dashboard...</p>
          </div>
      );
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">Access Denied or Error</h2>
            <p className="text-slate-500">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <div className="flex gap-4 items-center">
                 <Button variant="outline" size="sm" onClick={() => mutate()}>
                    Refresh
                 </Button>
                <Badge variant="outline" className="w-fit px-3 py-1 bg-white">
                    {format(new Date(), 'PPP')}
                </Badge>
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatsCard 
                title="Total Revenue" 
                value={metrics?.totalRevenue ? `₹${metrics.totalRevenue.toLocaleString()}` : '₹0'} 
                icon={DollarSign} 
                trend="+12% from last month"
                color="text-emerald-600"
                bgColor="bg-emerald-100"
            />
            <StatsCard 
                title="Today's Appointments" 
                value={metrics?.todaysAppointments || 0} 
                icon={Calendar} 
                trend="4 pending confirmation"
                color="text-blue-600"
                bgColor="bg-blue-100"
            />
             <StatsCard 
                title="Total Members" 
                value={metrics?.membershipCounts ? Object.values(metrics.membershipCounts).reduce((a, b) => a + b, 0) : 0} 
                icon={Users} 
                trend={`+${metrics?.recentEnrollments || 0} this week`}
                color="text-purple-600"
                bgColor="bg-purple-100"
            />
             <StatsCard 
                title="Low Stock Items" 
                value={metrics?.lowStockCount || 0} 
                icon={Package} 
                trend="Requires attention"
                color="text-amber-600"
                bgColor="bg-amber-100"
            />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 mb-8">
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
                            {metrics?.membershipCounts && Object.entries(metrics.membershipCounts).map(([tier, count]) => (
                                <div key={tier} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={cn("w-3 h-3 rounded-full mr-3", 
                                            tier === 'PLATINUM' ? 'bg-slate-800' :
                                            tier === 'GOLD' ? 'bg-amber-400' :
                                            tier === 'SILVER' ? 'bg-slate-400' : 'bg-slate-200'
                                        )} />
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
                            {recentActivity?.map((booking) => (
                                <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {/* @ts-expect-error - UserDTO vs string union type complexity */}
                                        {booking.userId?.name || booking.userId?.phone || 'Guest'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {/* @ts-expect-error - ServiceDTO vs string union type complexity */}
                                        {booking.serviceId?.name || 'Service'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {format(new Date(booking.date), 'MMM dd, HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        ₹{booking.pricePaid}
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

// Helper to avoid `any` in props
interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend: string;
    color: string;
    bgColor: string;
}

function StatsCard({ title, value, icon: Icon, trend, color, bgColor }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 font-medium text-sm">{title}</span>
                <div className={cn("p-2 rounded-lg", bgColor, color)}>
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


// Utility to combine classes (if not already imported from lib/utils)
import { cn } from "@/lib/utils";

