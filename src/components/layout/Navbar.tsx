"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Memberships", href: "/memberships" },
    { label: "Products", href: "/products" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mores
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {user?.role === 'ADMIN' ? (
               // Admin Links
               <>
                  <Link href="/admin" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Dashboard</Link>
                  <Link href="/admin/bookings" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Bookings</Link>
                  <Link href="/admin/users" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Users</Link>
                  <Link href="/admin/services" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Services</Link>
                  <Link href="/admin/finance" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Finance</Link>
               </>
            ) : (
               // Customer Links
               <>
                  <Link href="/" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Home</Link>
                  <Link href="/services" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Services</Link>
                  <Link href="/products" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Products</Link>
                  <Link href="/gallery" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Gallery</Link>
                  <Link href="/memberships" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">Memberships</Link>
                  {user && (
                    <Link href="/my-bookings" className="text-sm font-medium transition-colors hover:text-purple-600 text-slate-600 dark:text-slate-400">My Bookings</Link>
                  )}
               </>
            )}
          </div>

          {/* User / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-4">
                   {user.role === 'ADMIN' && (
                     <Link href="/admin">
                       <Button variant="outline" size="sm">Admin</Button>
                     </Link>
                   )}
                   <Link href="/profile">
                     <Button variant="ghost" size="sm">Profile</Button>
                   </Link>
                   <Link href="/my-bookings">
                     <Button variant="ghost" size="sm">Bookings</Button>
                   </Link>
                   <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <UserIcon className="w-4 h-4 ml-2" />
                     {/* <span>{user.phone}</span> */}
                   </div>
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
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col p-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-purple-600 dark:text-slate-400"
              >
                {item.label}
              </Link>
            ))}
             <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                {!loading && (
                  user ? (
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-2 text-sm font-medium">
                         <UserIcon className="w-4 h-4" />
                         <span>{user.phone}</span>
                       </div>
                       {user.role === 'ADMIN' && (
                         <Link href="/admin">
                           <Button variant="outline" size="sm" className="w-full">Admin Dashboard</Button>
                         </Link>
                       )}
                       <Link href="/profile">
                          <Button variant="ghost" size="sm" className="w-full justify-start">My Profile</Button>
                       </Link>
                       <Link href="/my-bookings">
                           <Button variant="ghost" size="sm" className="w-full justify-start">My Bookings</Button>
                       </Link>
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button size="sm" className="w-full">Login</Button>
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
