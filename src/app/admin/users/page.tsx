"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Ban, CheckCircle, Trash2, MoreVertical, Shield, Phone, Mail, Calendar, Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [membershipFilter, setMembershipFilter] = useState("ALL");
  const [membershipUser, setMembershipUser] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  
  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (roleFilter !== 'ALL') params.append('role', roleFilter);
    if (membershipFilter !== 'ALL') params.append('membership', membershipFilter);

    fetch(`/api/admin/users?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
          if (data.users) setUsers(data.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
     // Fetch memberships for filter
     fetch('/api/admin/memberships')
        .then(res => res.json())
        .then(data => {
            if (data.memberships) setMemberships(data.memberships);
        });
  }, []);

  useEffect(() => {
     // Debounce search
     const timer = setTimeout(() => {
         fetchUsers();
     }, 500);
     return () => clearTimeout(timer);
  }, [search, roleFilter, membershipFilter]);

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
      if (!confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) return;
      
      try {
          const res = await fetch(`/api/admin/users/${userId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isBlocked: !currentStatus })
          });
          if (res.ok) {
              fetchUsers(); // Refresh
          } else {
              alert("Failed to update status");
          }
      } catch (e) {
          console.error(e);
          alert("Error updating status");
      }
  };

  const deleteUser = async (userId: string) => {
      if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

      try {
          const res = await fetch(`/api/admin/users/${userId}`, {
              method: "DELETE"
          });
          if (res.ok) {
              fetchUsers();
          } else {
              const data = await res.json();
              alert(data.error || "Failed to delete user");
          }
      } catch (e) {
          alert("Error deleting user");
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-purple-500/30">
      <Navbar />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">Users</h1>
                <p className="text-slate-400 text-sm sm:text-base">Manage customers and administrators</p>
            </div>
            
            <Link href="/admin" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Back to Dashboard
                </Button>
            </Link>
        </div>

        {/* Filters & Search - Responsive Layout */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                    placeholder="Search by name, email, or phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-slate-700 w-full"
                />
            </div>
            
            {/* Filters Grid for Mobile/Tablet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-3 w-full lg:w-auto">
                <select 
                    className="h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 w-full"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                </select>

                 <select 
                    className="h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 w-full"
                    value={membershipFilter}
                    onChange={(e) => setMembershipFilter(e.target.value)}
                >
                    <option value="ALL">All Memberships</option>
                    <option value="NORMAL">Normal</option>
                    {memberships.filter(m => m.name !== 'NORMAL').map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                </select>

                <Button variant="outline" onClick={fetchUsers} className="w-full sm:w-auto lg:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 relative z-0">
                    Refresh
                </Button>
            </div>
            
            {/* Merge User Button (Desktop: Top Right, Mobile: Below Search) */}
            <MergeUserModal onSuccess={fetchUsers} />
        </div>

        {/* Users Content Area */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
            
            {/* --------------------
                DESKTOP TABLE VIEW
                Hidden on mobile (md breakpoint)
               -------------------- */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-medium border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Membership</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">{user.name || "N/A"}</div>
                                        <div className="text-xs text-slate-500">Joined {format(new Date(user.createdAt), 'MMM yyyy')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-300">{user.phone}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'ADMIN' ? (
                                            <Badge className="bg-purple-900/50 text-purple-300 hover:bg-purple-900/50 border-none">
                                                <Shield className="w-3 h-3 mr-1" /> Admin
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-500">Customer</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={`
                                            ${user.membershipId?.name === 'PLATINUM' ? 'border-slate-700 text-slate-300 bg-slate-800' : 
                                              user.membershipId?.name === 'GOLD' ? 'border-amber-900/50 text-amber-400 bg-amber-950/20' : 
                                              user.membershipId?.name === 'SILVER' ? 'border-slate-600 text-slate-400 bg-slate-800/50' : 
                                              'border-slate-800 text-slate-600'}
                                        `}>
                                            {user.membershipId?.name || 'NORMAL'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isBlocked ? (
                                            <Badge variant="destructive">Blocked</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-950/30 text-green-400 hover:bg-green-950/30 border border-green-900">Active</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={user.isBlocked ? "text-green-500 hover:text-green-400 hover:bg-green-900/20" : "text-amber-500 hover:text-amber-400 hover:bg-amber-900/20"}
                                                onClick={() => toggleBlock(user._id, user.isBlocked)}
                                                title={user.isBlocked ? "Unblock User" : "Block User"}
                                            >
                                                {user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                <span className="sr-only">{user.isBlocked ? "Unblock" : "Block"}</span>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                onClick={() => setMembershipUser(user)}
                                                title="Edit Membership"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>

                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                onClick={() => deleteUser(user._id)}
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --------------------
                MOBILE CARD VIEW
                Visible only on mobile (hidden on md+)
               -------------------- */}
            <div className="md:hidden p-4 space-y-4">
                {loading ? (
                    // Skeleton Loaders for Mobile
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-slate-950 rounded-lg border border-slate-800 p-4 animate-pulse space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="h-5 bg-slate-800 rounded w-1/3"></div>
                                <div className="h-5 bg-slate-800 rounded w-16"></div>
                            </div>
                            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                            <div className="space-y-2 pt-2">
                                <div className="h-8 bg-slate-800 rounded w-full"></div>
                            </div>
                        </div>
                    ))
                ) : users.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 border border-slate-800 border-dashed rounded-lg">
                        No users found matching your criteria.
                    </div>
                ) : (
                    users.map(user => (
                        <div key={user._id} className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-4 shadow-sm relative">
                            {/* Card Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-slate-200 text-lg line-clamp-1">{user.name || "N/A"}</div>
                                    <div className="text-xs text-slate-500 flex items-center mt-1">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                                    </div>
                                </div>
                                {user.isBlocked ? (
                                    <Badge variant="destructive" className="h-6">Blocked</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-950/30 text-green-400 border border-green-900 h-6">Active</Badge>
                                )}
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2 text-sm border-t border-slate-800/50 pt-3">
                                <div className="flex items-center text-slate-300">
                                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                                    {user.phone}
                                </div>
                                <div className="flex items-center text-slate-300 truncate">
                                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                                    <span className="truncate">{user.email || "No email"}</span>
                                </div>
                            </div>

                            {/* Badges Row */}
                            <div className="flex flex-wrap gap-2">
                                {/* Role */}
                                {user.role === 'ADMIN' ? (
                                    <Badge className="bg-purple-900/50 text-purple-300 border-none">
                                        <Shield className="w-3 h-3 mr-1" /> Admin
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-slate-800 text-slate-500 bg-slate-900">
                                        Customer
                                    </Badge>
                                )}

                                {/* Membership */}
                                <Badge variant="outline" className={`
                                    ${user.membershipId?.name === 'PLATINUM' ? 'border-slate-700 text-slate-300 bg-slate-800' : 
                                      user.membershipId?.name === 'GOLD' ? 'border-amber-900/50 text-amber-400 bg-amber-950/20' : 
                                      user.membershipId?.name === 'SILVER' ? 'border-slate-600 text-slate-400 bg-slate-800/50' : 
                                      'border-slate-800 text-slate-600'}
                                `}>
                                    {user.membershipId?.name || 'NORMAL'}
                                </Badge>
                            </div>

                            {/* Action Buttons (Full width on mobile) */}
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => toggleBlock(user._id, user.isBlocked)}
                                    className={`border-slate-800 ${user.isBlocked ? "text-green-500 hover:bg-green-900/10 hover:text-green-400" : "text-amber-500 hover:bg-amber-900/10 hover:text-amber-400"}`}
                                >
                                    {user.isBlocked ? "Unblock" : "Block"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setMembershipUser(user)}
                                    className="border-slate-800 text-blue-400 hover:bg-blue-900/10 hover:text-blue-300"
                                >
                                    Membership
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => deleteUser(user._id)}
                                    className="border-slate-800 text-red-400 hover:bg-red-900/10 hover:text-red-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900 text-xs sm:text-sm text-slate-500 text-center">
                Showing {users.length} users
            </div>
            
            <MembershipModal 
                user={membershipUser} 
                onClose={() => setMembershipUser(null)} 
                onSuccess={fetchUsers} 
            />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function MembershipModal({ user, onClose, onSuccess }: any) {
    const [memberships, setMemberships] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState("");

    useEffect(() => {
        if (user) {
            setSelectedId(user.membershipId?._id || user.membershipId || "");
            // Fetch membership options
            fetch('/api/admin/memberships')
                .then(res => res.json())
                .then(data => {
                    if (data.memberships) setMemberships(data.memberships);
                });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        await fetch(`/api/admin/users/${user._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ membershipId: selectedId })
        });
        onSuccess();
        onClose();
    };

    if (!user) return null;

    return (
         <Dialog open={!!user} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full mx-4 rounded-xl bg-slate-900 border-slate-800 text-slate-50 p-6 overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-slate-50 text-xl">Update Membership</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 pt-2">
                     <p className="text-sm text-slate-400">
                         User: <span className="font-semibold text-slate-200">{user.name}</span>
                     </p>
                     
                     <div className="grid gap-2 text-slate-200 max-h-[60vh] overflow-y-auto pr-1">
                        <div 
                                onClick={() => setSelectedId("")} // Empty string for Normal/Null
                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${!selectedId ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="font-medium flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${!selectedId ? 'bg-purple-500' : 'bg-slate-600'}`}></div>
                                    Normal (No Membership)
                                </div>
                        </div>

                         {memberships.filter(m => m.name !== 'NORMAL').map((m) => (
                             <div 
                                key={m._id} 
                                onClick={() => setSelectedId(m._id)}
                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedId === m._id ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}
                             >
                                 <div className="font-medium flex items-center gap-2">
                                     <Crown className={`w-4 h-4 ${selectedId === m._id ? 'text-purple-400' : 'text-slate-500'}`} />
                                     {m.name}
                                 </div>
                                 <div className="text-sm font-semibold text-slate-400">₹{m.price}</div>
                             </div>
                         ))}
                     </div>
                </div>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800 w-full sm:w-auto">Cancel</Button>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MergeUserModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [sourcePhone, setSourcePhone] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null); // { sourceUser, targetUser }
    const [previewLoading, setPreviewLoading] = useState(false);

    const checkUsers = async () => {
        if (!sourcePhone || !targetEmail) return alert("Please enter both Phone and Email");
        setPreviewLoading(true);
        try {
            // Fetch both users to confirm they exist (Mocking fetch via search API for now or dedicated check)
            // Ideally we'd have a check-merge endpoint, but we can rely on admin intelligence or simpler search
            // For now, let's just proceed to 'Ready to Merge' state if inputs are present, 
            // the real validation happens on backend or we can fetch them individually.
            
            // To make it robust without extra API, let's just fetch users via search param
            const sourceRes = await fetch(`/api/admin/users?search=${encodeURIComponent(sourcePhone)}`);
            const targetRes = await fetch(`/api/admin/users?search=${encodeURIComponent(targetEmail)}`);
            
            const sourceJson = await sourceRes.json();
            const targetJson = await targetRes.json();
            
            const sUser = sourceJson.users?.find((u: any) => u.phone === sourcePhone || u.phone === `+91${sourcePhone}` || u.phone?.includes(sourcePhone));
            const tUser = targetJson.users?.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase());

            if (!sUser) return alert("Source User (Walk-in) not found with this phone.");
            if (!tUser) return alert("Target User (Google Account) not found with this email.");
            if (sUser._id === tUser._id) return alert("These are already the same user!");

            setPreviewData({ sourceUser: sUser, targetUser: tUser });

        } catch (e) {
            console.error(e);
            alert("Error checking users");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleMerge = async () => {
        if (!previewData) return;
        if (!confirm(`Are you sure you want to merge ${previewData.sourceUser.name} INTO ${previewData.targetUser.name}? This action cannot be undone.`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/users/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceUserId: previewData.sourceUser._id,
                    targetUserId: previewData.targetUser._id
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Merge Successful!");
                setOpen(false);
                setPreviewData(null);
                setSourcePhone("");
                setTargetEmail("");
                onSuccess();
            } else {
                alert(data.error || "Merge Failed");
            }
        } catch (e) {
            alert("An error occurred during merge");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)}>
                 <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Merge Users
                 </Button>
            </div>
            <DialogContent className="max-w-lg w-full bg-slate-950 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Merge Accounts</DialogTitle>
                    <p className="text-sm text-slate-400">
                        Migrate bookings/membership from a Walk-in account (Phone) to a Google Account (Email). The Walk-in account will be DELETED.
                    </p>
                </DialogHeader>

                {!previewData ? (
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-amber-500">Source (Walk-in) Phone</label>
                            <Input 
                                placeholder="e.g. 9876543210" 
                                value={sourcePhone}
                                onChange={e => setSourcePhone(e.target.value)}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-blue-500">Target (Google) Email</label>
                            <Input 
                                placeholder="e.g. user@gmail.com" 
                                value={targetEmail}
                                onChange={e => setTargetEmail(e.target.value)}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>
                        <Button onClick={checkUsers} disabled={previewLoading} className="w-full bg-slate-800 text-slate-200 hover:bg-slate-700">
                            {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Users"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5 mt-4">
                        <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-lg">
                            <div className="text-xs text-amber-500 font-bold uppercase mb-1">Source (Will be Deleted)</div>
                            <div className="font-semibold">{previewData.sourceUser.name}</div>
                            <div className="text-sm text-slate-400">{previewData.sourceUser.phone}</div>
                            <div className="text-xs text-slate-500 mt-1">Status: {previewData.sourceUser.role}</div>
                        </div>

                         <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-slate-950 p-2 rounded-full border border-slate-800">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                            </div>
                         </div>

                        <div className="p-3 bg-blue-950/20 border border-blue-900/50 rounded-lg">
                            <div className="text-xs text-blue-500 font-bold uppercase mb-1">Target (Will Keep History)</div>
                            <div className="font-semibold">{previewData.targetUser.name}</div>
                            <div className="text-sm text-slate-400">{previewData.targetUser.email}</div>
                             <div className="text-xs text-slate-500 mt-1">Will receive bookings & phone number</div>
                        </div>

                        <Button onClick={handleMerge} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "CONFIRM MERGE"}
                        </Button>
                        <Button variant="ghost" onClick={() => setPreviewData(null)} className="w-full">
                            Back
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
