"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Calendar, ChevronDown, Crown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, loading, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Define Navigation Items based on Roles
  const customerNavItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Gallery", href: "/gallery" },
    { label: "Memberships", href: "/memberships" },
  ];

  const adminNavItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Bookings", href: "/admin/bookings" },
    { label: "Users", href: "/admin/users" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
    { label: "Services", href: "/admin/services" },
    { label: "Gallery", href: "/admin/gallery" },
    { label: "Products", href: "/admin/products" },
    { label: "Finance", href: "/admin/finance" },
    { label: "Memberships", href: "/admin/memberships" },
  ];

  // Determine which items to show
  const activeNavItems = user?.role === 'ADMIN' ? adminNavItems : customerNavItems;

  // Use logout from context directly
  const handleLogout = async () => {
      await logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Mores
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
             {activeNavItems.map((item) => (
               <Link 
                  key={item.href} 
                  href={item.href} 
                  className="text-sm font-medium transition-colors hover:text-amber-500 text-slate-600 dark:text-slate-400"
               >
                  {item.label}
               </Link>
             ))}
          </div>

          {/* User / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="relative" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
                   <button 
                     onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                     className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                     aria-label="User Menu"
                     aria-expanded={isUserMenuOpen}
                   >
                     <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                     </div>
                     <ChevronDown className="w-4 h-4 text-slate-400" />
                   </button>

                   {/* Dropdown */}
                   {isUserMenuOpen && (
                     <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg p-2 dark:border-slate-800 dark:bg-slate-900 z-50">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                           <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{user.name || 'User'}</p>
                           <p className="text-xs text-slate-500 truncate">{user.phone}</p>
                        </div>

                        {user.role === 'ADMIN' && (
                           <Link href="/admin" onClick={() => setIsUserMenuOpen(false)}>
                             <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
                                <LayoutDashboard className="w-4 h-4" />
                                Admin Dashboard
                             </div>
                           </Link>
                        )}
                        
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)}>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
                             <UserIcon className="w-4 h-4" />
                             My Profile
                          </div>
                        </Link>

                        <Link href="/my-membership" onClick={() => setIsUserMenuOpen(false)}>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
                             <Crown className="w-4 h-4" />
                             My Membership
                          </div>
                        </Link>
                        
                        <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/10 cursor-pointer transition-colors">
                           <LogOut className="w-4 h-4" />
                           Log Out
                        </button>
                     </div>
                   )}
                </div>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                    Login
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Mobile Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-xl border-t border-slate-200 dark:bg-slate-950/95 dark:border-slate-800 z-50 overflow-y-auto">
          <div className="flex flex-col p-6 space-y-6">
            <div className="flex flex-col space-y-4">
              {activeNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-slate-600 hover:text-amber-500 dark:text-slate-300 dark:hover:text-amber-400 py-2 border-b border-slate-100 dark:border-slate-800/50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
             
             <div className="pt-2">
                {!loading && (
                  user ? (
                    <div className="flex flex-col gap-4">
                       <div className="flex items-center gap-3 text-base font-medium text-slate-900 dark:text-slate-50 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl">
                         <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <UserIcon className="w-5 h-5" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Signed in as</span>
                            <span>{user.name || user.phone}</span>
                         </div>
                       </div>
                       
                       <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button className="w-full justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                             Manage Profile
                          </Button>
                       </Link>

                       <Link href="/my-membership" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full justify-center border-slate-200 dark:border-slate-800">
                             <Crown className="w-4 h-4 mr-2 text-amber-500" />
                             My Membership
                          </Button>
                       </Link>

                       <Button variant="ghost" className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleLogout}>
                          Log Out
                       </Button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button size="lg" className="w-full text-lg h-12">Login / Sign Up</Button>
                    </Link>
                  )
                )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}
