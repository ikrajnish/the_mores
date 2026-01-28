import { Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Mores Salon
            </h2>
            <p className="text-sm text-slate-500 max-w-[250px]">
              Premium beauty and wellness services tailored for you. Experience luxury at its finest.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="/services" className="hover:text-amber-500 transition-colors">Services</a></li>
              <li><a href="/memberships" className="hover:text-amber-500 transition-colors">Memberships</a></li>
              <li><a href="/products" className="hover:text-amber-500 transition-colors">Products</a></li>
              <li><a href="/gallery" className="hover:text-amber-500 transition-colors">Gallery</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
             <h3 className="font-semibold">Contact</h3>
             <div className="space-y-2 text-sm text-slate-500">
               <p className="leading-relaxed">
                 Mores the beauty destination,<br/>
                 Near Gokul Restaurant, Kanke Road,<br/>
                 Ranchi, Jharkhand - 834006
               </p>
               <p className="font-medium hover:text-amber-500 cursor-pointer transition-colors">+91 81026 03450</p>
               <p>hello@mores.com</p>
             </div>
          </div>

          {/* Social / Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <div className="flex space-x-3">
               <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 group">
                  <Facebook className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-white" />
               </a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 group">
                  <Instagram className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-white" />
               </a>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-800 py-6 border-t border-slate-800 text-center text-xs text-slate-400">
          © 2026 Mores Salon Application. All rights reserved.
      </div>
    </footer>
  );
}
