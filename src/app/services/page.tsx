import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import connectDB from "@/lib/db";
import ServiceCategory from "@/models/ServiceCategory";
import Subcategory from "@/models/Subcategory";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import ServicesExplorer, { CategoryData, SubcategoryData, ServiceData } from "@/components/services/ServicesExplorer";

async function getServicesHierarchy(): Promise<CategoryData[]> {
  await connectDB();

  // 1. Fetch Categories
  const categories = await ServiceCategory.find({ name: { $not: /Bridal Packages/i } }).sort({ name: 1 }).lean();
  
  // 2. Fetch All Subcategories
  const subcategories = await Subcategory.find({}).lean();
  
  // 3. Fetch All Services
  const services = await Service.find({}).lean();
  
  // 4. Fetch All Prices and Memberships for mapping
  const pricings = await ServicePricing.find({}).lean();
  const memberships = await Membership.find({}).lean();
  
  const membershipMap = memberships.reduce((acc: any, m: any) => {
    acc[m._id.toString()] = m.name;
    return acc;
  }, {} as Record<string, string>);

  const normalMembership = memberships.find(m => m.name === "NORMAL");

  // Helper to process a service
  const processService = (service: any): ServiceData => {
    const servicePrices: Record<string, number> = {};
    
    // Filter prices for this service
    const myPrices = pricings.filter(p => p.serviceId.toString() === service._id.toString());
    
    myPrices.forEach(p => {
        if (p.membershipId && membershipMap[p.membershipId.toString()]) {
            servicePrices[membershipMap[p.membershipId.toString()]] = p.price;
        }
    });

    // Determine default display price (NORMAL)
    let defaultPrice = 0;
    if (servicePrices["NORMAL"]) {
        defaultPrice = servicePrices["NORMAL"];
    } else if (normalMembership) {
        // Try to find if we missed it or it wasn't mapped correctly? 
        // Logic should be sound. If no normal price, it's 0.
        // Or if there's a price with null membershipId?
        const basePrice = myPrices.find(p => !p.membershipId);
        if (basePrice) defaultPrice = basePrice.price;
    }

    return {
      _id: service._id.toString(),
      name: service.name,
      image: service.image,
      duration: service.duration,
      price: defaultPrice,
      shortDescription: service.shortDescription,
      prices: servicePrices,
      categoryId: service.categoryId.toString()
    };
  };

  // Build Hierarchy
  const hierarchy: CategoryData[] = categories.map(cat => {
    const catId = cat._id.toString();
    
    // Find subcategories for this category
    const catSubcats = subcategories.filter(s => s.categoryId.toString() === catId);
    
    // Find services for this category
    const catServices = services.filter(s => s.categoryId.toString() === catId);

    // Group services by subcategory
    const processedSubcats: SubcategoryData[] = catSubcats.map(sub => {
        const subId = sub._id.toString();
        const subServices = catServices.filter(s => s.subcategory?.toString() === subId).map(processService);
        
        return {
            _id: subId,
            name: sub.name,
            services: subServices
        };
    }).filter(s => s.services.length > 0); // Only include subcategories with services

    // Handle Uncategorized Services (General)
    const uncategorizedServices = catServices.filter(s => !s.subcategory).map(processService);
    
    if (uncategorizedServices.length > 0) {
        processedSubcats.unshift({
            _id: 'general',
            name: 'General Services',
            services: uncategorizedServices
        });
    }

    return {
        _id: catId,
        name: cat.name,
        image: cat.image,
        subcategories: processedSubcats
    };
  }).filter(c => c.subcategories.length > 0); // Only include categories with content

  return hierarchy;
}

export default async function ServicesPage() {
  const hierarchy = await getServicesHierarchy();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent inline-block mb-4">
            Our Services
          </h1>
          <p className="text-slate-400">
             Explore our premium treatments. Select a category to get started.
          </p>
        </div>

        <ServicesExplorer categories={hierarchy} />
      </main>
      
      <Footer />
    </div>
  );
}
