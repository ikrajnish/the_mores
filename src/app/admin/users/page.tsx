"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Ban, CheckCircle, Trash2, MoreVertical, Shield } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [membershipUser, setMembershipUser] = useState<any>(null);
  
  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (roleFilter !== 'ALL') params.append('role', roleFilter);

    fetch(`/api/admin/users?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
          if (data.users) setUsers(data.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
     // Debounce search
     const timer = setTimeout(() => {
         fetchUsers();
     }, 500);
     return () => clearTimeout(timer);
  }, [search, roleFilter]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Users</h1>
                <p className="text-slate-500">Manage customers and administrators</p>
            </div>
            
            <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
            </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search by name, email, or phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>
            <div className="flex gap-4">
                <select 
                    className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <Button variant="outline" onClick={fetchUsers}>
                    Refresh
                </Button>
            </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Membership</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
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
                                <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{user.name || "N/A"}</div>
                                        <div className="text-xs text-slate-500">Joined {format(new Date(user.createdAt), 'MMM yyyy')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900">{user.phone}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'ADMIN' ? (
                                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                                                <Shield className="w-3 h-3 mr-1" /> Admin
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-600">Customer</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={`
                                            ${user.membershipId?.name === 'PLATINUM' ? 'border-slate-800 text-slate-900 bg-slate-50' : 
                                              user.membershipId?.name === 'GOLD' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                              user.membershipId?.name === 'SILVER' ? 'border-slate-300 text-slate-600 bg-slate-50' : 
                                              'border-slate-100 text-slate-500'}
                                        `}>
                                            {user.membershipId?.name || 'NORMAL'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isBlocked ? (
                                            <Badge variant="destructive">Blocked</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={user.isBlocked ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
                                                onClick={() => toggleBlock(user._id, user.isBlocked)}
                                                title={user.isBlocked ? "Unblock User" : "Block User"}
                                            >
                                                {user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                <span className="sr-only">{user.isBlocked ? "Unblock" : "Block"}</span>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => setMembershipUser(user)}
                                                title="Edit Membership"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>

                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
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
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
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
            <DialogContent>
                <DialogHeader><DialogTitle>Update Membership for {user.name}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                     <p className="text-sm text-slate-500">
                         Current Membership: <span className="font-semibold text-slate-900">{typeof user.membershipId === 'object' ? user.membershipId?.name : 'Unknown'}</span>
                     </p>
                     
                     <div className="grid gap-2">
                         {memberships.map((m) => (
                             <div 
                                key={m._id} 
                                onClick={() => setSelectedId(m._id)}
                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center ${selectedId === m._id ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-slate-200 hover:border-slate-300'}`}
                             >
                                 <div className="font-medium">{m.name}</div>
                                 <div className="text-sm text-slate-500">₹{m.price}</div>
                             </div>
                         ))}
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Update User Membership</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
