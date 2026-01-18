export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
              <li><a href="/services" className="hover:text-purple-600">Services</a></li>
              <li><a href="/memberships" className="hover:text-purple-600">Memberships</a></li>
              <li><a href="/products" className="hover:text-purple-600">Products</a></li>
              <li><a href="/gallery" className="hover:text-purple-600">Gallery</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
             <h3 className="font-semibold">Contact</h3>
             <ul className="space-y-2 text-sm text-slate-500">
               <li>123 Luxury Lane, City</li>
               <li>+91 99999 99999</li>
               <li>hello@mores.com</li>
             </ul>
          </div>

          {/* Social / Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <div className="flex space-x-2">
               {/* Placeholders for social icons */}
               <div className="w-8 h-8 bg-slate-200 rounded-full dark:bg-slate-800"></div>
               <div className="w-8 h-8 bg-slate-200 rounded-full dark:bg-slate-800"></div>
               <div className="w-8 h-8 bg-slate-200 rounded-full dark:bg-slate-800"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
           © 2026 Mores Salon Application. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
