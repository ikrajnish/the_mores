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

import { UserProfileModal } from "@/components/admin/UserProfileModal";

function WalkInModal({ isOpen, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({ phone: '', email: '', name: '', date: '', slot: '' });
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    
    // New Features State
    const [services, setServices] = useState<any[]>([]);
    const [pricing, setPricing] = useState<any[]>([]);
    const [memberships, setMemberships] = useState<any[]>([]); // Available memberships
    const [selectedMembershipId, setSelectedMembershipId] = useState(''); // Manual override
    const [serviceSearch, setServiceSearch] = useState(''); // Service search
    const [foundUser, setFoundUser] = useState<any>(null); // For View Profile

    const [loadingServices, setLoadingServices] = useState(false);
    
    // Profile Modal State
    const [profileUserId, setProfileUserId] = useState<string | null>(null);
    
    useEffect(() => {
        if (!isOpen) return;
        
        // Fetch services & memberships
        const fetchData = async () => {
             setLoadingServices(true);
             try {
                 const [resServices, resMemberships] = await Promise.all([
                     fetch('/api/admin/services'),
                     fetch('/api/admin/memberships')
                 ]);

                 const dataServices = await resServices.json();
                 const dataMemberships = await resMemberships.json();

                 if (dataServices.services) setServices(dataServices.services);
                 if (dataServices.pricing) setPricing(dataServices.pricing);
                 if (dataMemberships.memberships) {
                     setMemberships(dataMemberships.memberships);
                     // Set default to NORMAL
                     const normal = dataMemberships.memberships.find((m: any) => m.name === 'NORMAL');
                     if (normal) setSelectedMembershipId(normal._id);
                 }
             } catch (err) {
                 console.error("Failed to load data", err);
             } finally {
                 setLoadingServices(false);
             }
        };
        fetchData();
        
        // Set default date to today and time to now
        const now = new Date();
        setFormData(prev => ({ 
            ...prev, 
            date: prev.date || format(now, 'yyyy-MM-dd'),
            slot: prev.slot || format(now, 'HH:mm') 
        }));
        setSelectedServices([]);
        setSelectedServiceId('');
        setServiceSearch('');
        setFoundUser(null);
        setProfileUserId(null);

    }, [isOpen]);

    // User Search Effect
    useEffect(() => {
        const searchUser = async () => {
             if (!formData.phone && !formData.email) {
                 setFoundUser(null);
                 return;
             }
             const contact = formData.phone || formData.email;
             if (contact.length < 4) return; // Min length

             try {
                 const params = new URLSearchParams();
                 params.append('search', contact);
                 const res = await fetch(`/api/admin/users?${params.toString()}`);
                 const data = await res.json();
                 if (data.users && data.users.length > 0) {
                     // Find added exact match if possible
                     const exact = data.users.find((u: any) => u.phone === contact || u.email === contact);
                     setFoundUser(exact || data.users[0]);
                     
                     // Auto-fill name if empty
                     if (!formData.name && (exact || data.users[0]).name) {
                         setFormData(prev => ({ ...prev, name: (exact || data.users[0]).name }));
                     }
                 } else {
                     setFoundUser(null);
                 }
             } catch (e) {
                 console.error("User search failed", e);
             }
        };

        const timer = setTimeout(searchUser, 800);
        return () => clearTimeout(timer);
    }, [formData.phone, formData.email]);

    // Recalculate prices when membership changes
    useEffect(() => {
        if (selectedServices.length > 0 && selectedMembershipId) {
            const updatedServices = selectedServices.map(s => {
                const priceObj = pricing.find((p: any) => p.serviceId === s._id && p.membershipId?._id === selectedMembershipId);
                // If specific price not found, fallback to NORMAL price or 0 (or keep existing if we want stricter logic)
                // Logic: find price for this membership.
                let newPrice = 0;
                if (priceObj && priceObj.price > 0) {
                    newPrice = priceObj.price;
                } else {
                    // Try finding NORMAL price as fallback
                    const normalMem = memberships.find(m => m.name === 'NORMAL');
                    if (normalMem) {
                        const normalPrice = pricing.find((p: any) => p.serviceId === s._id && p.membershipId?._id === normalMem._id);
                        newPrice = normalPrice ? normalPrice.price : 0;
                    }
                }
                return { ...s, price: newPrice };
            });
            setSelectedServices(updatedServices);
        }
    }, [selectedMembershipId]);


    const handleAddService = (serviceId: string) => {
        const service = services.find(s => s._id === serviceId);
        if (!service) return;
        
        // Check duplicate
        if (selectedServices.some(s => s._id === serviceId)) {
            // Already handled by UI disable, but safe check
            return;
        }
        
        // Get price based on SELECTED Manual Membership
        let price = 0;
        // Try precise match first
        const priceObj = pricing.find((p: any) => p.serviceId === service._id && p.membershipId?._id === selectedMembershipId);
        
        if (priceObj && priceObj.price > 0) {
            price = priceObj.price;
        } else {
            // Fallback to NORMAL if price is 0 or missing
             const normalMem = memberships.find(m => m.name === 'NORMAL');
             if (normalMem) {
                 const normalPrice = pricing.find((p: any) => p.serviceId === service._id && p.membershipId?._id === normalMem._id);
                 price = normalPrice ? normalPrice.price : 0;
             }
        }
        
        setSelectedServices([...selectedServices, { ...service, price }]);
        // Keep search active for potentially adding more similar items? 
        // User might want to search something else.
        // setServiceSearch(''); // Optional: keep search text
    };

    const removeService = (id: string) => {
        setSelectedServices(selectedServices.filter(s => s._id !== id));
    };

    const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

    const handleSubmit = async () => {
        if (selectedServices.length === 0) {
            alert("Please select at least one service");
            return;
        }
        if (!formData.phone && !formData.email) {
            alert("Please enter Phone OR Email");
            return;
        }

        const res = await fetch('/api/admin/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                serviceIds: selectedServices.map(s => s._id),
                appliedMembershipId: selectedMembershipId // Send manual override
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            onSuccess();
            onClose();
            // Reset form
            setFormData({ phone: '', email: '', name: '', date: '', slot: '' });
            setSelectedServices([]);
        } else {
            alert(data.error || "Failed to create booking");
        }
    };

    // Filter services
    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-200 max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader><DialogTitle className="text-slate-50">Walk-in Booking</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    
                    {/* Left Column: Guest Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Guest Details</h3>
                        <div className="space-y-3">
                             <div>
                                 <label className="text-xs font-semibold text-slate-400 mb-1 block">Phone <span className="text-red-500">*</span></label>
                                 <div className="flex gap-2">
                                     <Input 
                                        placeholder="Phone Number" 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                        className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                                     />
                                 </div>
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
                             
                             <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-400 block">Guest Name</label>
                                {foundUser && (
                                    <div onClick={() => setProfileUserId(foundUser._id)}>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-800 text-slate-400 border-slate-700">
                                            <User className="w-3 h-3 mr-1" /> View Profile
                                        </Badge>
                                    </div>
                                )}
                             </div>
                             <Input 
                                placeholder="Guest Name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700"
                             />
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                             <h4 className="text-xs font-semibold text-slate-400 uppercase">Booking Time</h4>
                             <div className="grid grid-cols-2 gap-2">
                                <div>
                                     <label className="text-[10px] text-slate-500 mb-1 block">Date</label>
                                     <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-8 bg-slate-900 border-slate-800 text-slate-200 text-xs" />
                                </div>
                                <div>
                                     <label className="text-[10px] text-slate-500 mb-1 block">Time Slot</label>
                                     <Input type="time" value={formData.slot} onChange={e => setFormData({...formData, slot: e.target.value})} className="h-8 bg-slate-900 border-slate-800 text-slate-200 text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Services & Pricing */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Services</h3>
                            
                            {/* Manual Pricing Override */}
                            <select 
                                value={selectedMembershipId}
                                onChange={(e) => setSelectedMembershipId(e.target.value)}
                                className="h-6 text-xs bg-slate-800 border-slate-700 rounded text-slate-200 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                {memberships.map(m => (
                                    <option key={m._id} value={m._id}>{m.name} Price</option>
                                ))}
                            </select>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            {/* Service Search & List */}
                            <div className="flex flex-col h-full">
                                <div className="mb-2">
                                    <Input 
                                        placeholder="Search Service..." 
                                        className="h-9 bg-slate-900 border-slate-800 text-sm"
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 min-h-[250px] max-h-[300px] overflow-y-auto border border-slate-800 rounded-md bg-slate-900/50 p-1 space-y-1">
                                    {loadingServices ? (
                                        <div className="p-4 text-center text-slate-500 text-xs">Loading services...</div>
                                    ) : filteredServices.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500 text-xs">No services found</div>
                                    ) : (
                                        filteredServices.map((s) => {
                                            // Calculate display price based on manual selection
                                            let price = 0;
                                            const priceObj = pricing.find((p: any) => p.serviceId === s._id && p.membershipId?._id === selectedMembershipId);
                                            
                                            // Use specific price if exists AND is greater than 0
                                            if (priceObj && priceObj.price > 0) {
                                                price = priceObj.price;
                                            } else {
                                                // Fallback to NORMAL
                                                const normalMem = memberships.find(m => m.name === 'NORMAL');
                                                if (normalMem) {
                                                     const p = pricing.find((pr: any) => pr.serviceId === s._id && pr.membershipId?._id === normalMem._id);
                                                     if (p) price = p.price;
                                                }
                                            }

                                            const isAdded = selectedServices.some(sel => sel._id === s._id);

                                            return (
                                                <div 
                                                    key={s._id} 
                                                    className={cn(
                                                        "flex items-center justify-between p-2 rounded cursor-pointer transition-colors border border-transparent",
                                                        isAdded 
                                                            ? "bg-slate-800/50 opacity-50 cursor-not-allowed" 
                                                            : "hover:bg-slate-800 hover:border-slate-700 bg-slate-950"
                                                    )}
                                                    onClick={() => !isAdded && handleAddService(s._id)}
                                                >
                                                    <div className="flex-1 truncate mr-2">
                                                        <div className="font-medium text-slate-200 text-sm truncate">{s.name}</div>
                                                        <div className="text-[10px] text-slate-500">{s.duration} mins</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-slate-300 text-sm">₹{price}</div>
                                                        {isAdded && <span className="text-[10px] text-slate-500 font-medium">Added</span>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Selected Services Summary */}
                            <div className="mt-4">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selected Services ({selectedServices.length})</h4>
                                {selectedServices.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedServices.map((s, idx) => (
                                            <div key={`${s._id}-${idx}`} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2 rounded-md text-sm">
                                                <div className="truncate pr-3">
                                                    <div className="font-medium text-slate-200 truncate">{s.name}</div>
                                                    <div className="text-xs text-slate-500">₹{s.price}</div>
                                                </div>
                                                <button 
                                                    onClick={() => removeService(s._id)} 
                                                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                    title="Remove service"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="pt-2 flex justify-between items-center mt-2 border-t border-slate-800">
                                            <span className="text-sm font-bold text-slate-200">Total</span>
                                            <span className="text-xl font-bold text-slate-50">₹{totalPrice}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-xs text-slate-600 py-3 border border-dashed border-slate-800 rounded-lg">
                                        No services selected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} className="bg-slate-50 hover:bg-slate-200 text-slate-900 border-0 w-full md:w-auto px-8">Confirm Booking</Button>
                </DialogFooter>

                {/* Nested Profile Modal */}
                {profileUserId && (
                    <UserProfileModal 
                        userId={profileUserId} 
                        isOpen={!!profileUserId} 
                        onClose={() => setProfileUserId(null)} 
                    />
                )}
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
