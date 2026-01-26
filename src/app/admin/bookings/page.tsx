"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Calendar as CalendarIcon, Clock, Filter, AlertCircle, Phone, User, MonitorOff, Edit2, XCircle } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import { SimpleCalendar } from "@/components/ui/simple-calendar";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFilter) params.append('date', dateFilter);
    if (search) params.append('search', search);

    fetch(`/api/admin/bookings?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
          if (data.bookings) setBookings(data.bookings);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
     const timer = setTimeout(() => fetchBookings(), 500);
     return () => clearTimeout(timer);
  }, [dateFilter, search]);

  const updateStatus = async (id: string, status: string) => {
      if (!confirm(`Mark this booking as ${status}?`)) return;
      await fetch(`/api/admin/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
      });
      fetchBookings();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-50">Bookings</h1>
                <p className="text-slate-400">Manage appointments and walk-ins</p>
            </div>
            
            <div className="flex gap-2">
                 <Link href="/admin">
                     <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Back</Button>
                 </Link>
                 <Button onClick={() => setIsWalkInOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                     + Walk-in Booking
                 </Button>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                    placeholder="Search by customer name, phone, or service..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                />
            </div>
            <div className="flex gap-2 items-center relative z-20">
                <span className="text-sm font-medium text-slate-400">Date:</span>
                
                <div className="relative">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-800",
                            !dateFilter && "text-slate-500"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(parseISO(dateFilter), "PPP") : <span>Pick a date</span>}
                    </Button>
                    
                    {isCalendarOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsCalendarOpen(false)}
                            />
                            <div className="absolute top-full right-0 mt-2 z-20">
                                <SimpleCalendar 
                                    selected={dateFilter ? parseISO(dateFilter) : undefined}
                                    onSelect={(date) => {
                                        setDateFilter(format(date, 'yyyy-MM-dd'));
                                        setIsCalendarOpen(false);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>

                {(dateFilter || search) && (
                    <Button variant="ghost" onClick={() => { setDateFilter(""); setSearch(""); }} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        Clear
                    </Button>
                )}
            </div>
        </div>

        {/* Bookings List */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
             
             {loading ? (
                 <div className="p-8 text-center text-slate-500">Loading bookings...</div>
             ) : bookings.length === 0 ? (
                 <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                     <CalendarIcon className="w-12 h-12 mb-4 text-slate-700" />
                     <p>No bookings found.</p>
                 </div>
             ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-medium border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Detail</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {bookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">
                                            {format(parseISO(booking.date), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-purple-400 font-mono text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {booking.slot}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">{booking.userId?.name || "Unknown"}</div>
                                        <div className="text-xs text-slate-500">{booking.userId?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">{booking.serviceId?.name}</div>
                                        <div className="text-xs text-slate-500">{booking.serviceId?.duration} mins</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                                            {booking.membershipSnapshot}
                                        </Badge>
                                        <div className="mt-1 font-semibold text-slate-300">₹{booking.pricePaid}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                         <Badge className={cn({
                                             'bg-green-900/40 text-green-400 border border-green-800': booking.status === 'CONFIRMED',
                                             'bg-blue-900/40 text-blue-400 border border-blue-800': booking.status === 'COMPLETED',
                                             'bg-red-900/40 text-red-400 border border-red-800': booking.status === 'CANCELLED',
                                             'bg-amber-900/40 text-amber-400 border border-amber-800': booking.status === 'PENDING'
                                         })}>
                                             {booking.status}
                                         </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                                                <>
                                                 <Button size="sm" variant="ghost" title="Edit Booking" onClick={() => setEditingBooking(booking)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                                                     <Edit2 className="w-4 h-4" />
                                                 </Button>
                                                 <Button size="sm" variant="ghost" title="Cancel" onClick={() => updateStatus(booking._id, 'CANCELLED')} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                                     <XCircle className="w-4 h-4" />
                                                 </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             )}
        </div>
      </main>

      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} onSuccess={fetchBookings} />
      <EditBookingModal booking={editingBooking} onClose={() => setEditingBooking(null)} onSuccess={fetchBookings} />
      
      <Footer />
    </div>
  );
}

function WalkInModal({ isOpen, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({ phone: '', email: '', name: '', serviceId: '', date: '', slot: '' });
    const [services, setServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    
    useEffect(() => {
        if (!isOpen) return;
        
        // Fetch services for dropdown
        const fetchServices = async () => {
             setLoadingServices(true);
             try {
                 const res = await fetch('/api/admin/services');
                 const data = await res.json();
                 if (data.services) {
                     setServices(data.services);
                 }
             } catch (err) {
                 console.error("Failed to load services", err);
             } finally {
                 setLoadingServices(false);
             }
        };
        fetchServices();
        
        // Set default date to today and time to now
        const now = new Date();
        setFormData(prev => ({ 
            ...prev, 
            date: prev.date || format(now, 'yyyy-MM-dd'),
            slot: prev.slot || format(now, 'HH:mm') 
        }));

    }, [isOpen]);

    const handleSubmit = async () => {
        if (!formData.serviceId) {
            alert("Please select a service");
            return;
        }
        if (!formData.phone && !formData.email) {
            alert("Please enter Phone OR Email");
            return;
        }

        const res = await fetch('/api/admin/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            onSuccess();
            onClose();
            // Reset form
            setFormData({ phone: '', email: '', name: '', serviceId: '', date: '', slot: '' });
        } else {
            alert(data.error || "Failed to create booking");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader><DialogTitle className="text-slate-50">Walk-in Booking</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                             <label className="text-xs font-semibold text-slate-400 mb-1 block">Phone <span className="text-red-500">*</span></label>
                             <Input 
                                placeholder="Phone Number" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                             />
                        </div>
                        <div>
                             <label className="text-xs font-semibold text-slate-400 mb-1 block">Email</label>
                             <Input 
                                placeholder="Email (Optional)" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                             />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Guest Name</label>
                        <Input 
                            placeholder="Guest Name (Optional)" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Select Service</label>
                        <select 
                            className="w-full h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                            value={formData.serviceId}
                            onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                        >
                            <option value="">-- Choose Service --</option>
                            {loadingServices ? (
                                <option disabled>Loading services...</option>
                            ) : (
                                services.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name} ({s.duration} mins)
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                             <label className="text-xs font-semibold text-slate-400 mb-1 block">Date</label>
                             <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-slate-950 border-slate-800 text-slate-200" />
                        </div>
                        <div>
                             <label className="text-xs font-semibold text-slate-400 mb-1 block">Time Slot</label>
                             <Input type="time" placeholder="Slot (e.g. 10:00 AM)" value={formData.slot} onChange={e => setFormData({...formData, slot: e.target.value})} className="bg-slate-950 border-slate-800 text-slate-200" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white border-0">Book Appointment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function EditBookingModal({ booking, onClose, onSuccess }: any) {
    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (booking) {
            setDate(booking.date ? format(parseISO(booking.date), 'yyyy-MM-dd') : '');
            setSlot(booking.slot);
            setStatus(booking.status || 'CONFIRMED');
        }
    }, [booking]);

    const handleSave = async () => {
        if (!booking) return;
        await fetch(`/api/admin/bookings/${booking._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, slot, status })
        });
        onSuccess();
        onClose();
    };

    if (!booking) return null;

    return (
        <Dialog open={!!booking} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader><DialogTitle className="text-slate-50">Edit Booking</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                     <p className="text-sm text-slate-400">
                         Editing booking for {booking.userId?.name || 'Guest'}
                     </p>
                     
                     <div>
                        <label className="text-sm font-medium mb-1 block text-slate-300">Status</label>
                        <select 
                            className="w-full h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block text-slate-300">Date</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                        </div>
                        <div>
                             <label className="text-sm font-medium mb-1 block text-slate-300">Time Slot</label>
                             <Input placeholder="Slot (e.g. 02:00 PM)" value={slot} onChange={e => setSlot(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                        </div>
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white border-0">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
