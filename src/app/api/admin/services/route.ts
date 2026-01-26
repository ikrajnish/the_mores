import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import ServiceCategory from "@/models/ServiceCategory"; 
import { serviceSchema } from "@/lib/validations";
// import Membership from "@/models/Membership"; // Not needed if just populating

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        const services = await Service.find().populate('categoryId').populate('subcategory').lean();
        const pricing = await ServicePricing.find({ serviceId: { $in: services.map((s: any) => s._id) } }).populate('membershipId').lean();
        const categories = await ServiceCategory.find().lean();
        
        return NextResponse.json({ services, pricing, categories });
    
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        
        const validation = serviceSchema.safeParse(body);

        if (!validation.success) {
             return NextResponse.json({ error: "Invalid Data", details: validation.error.format() }, { status: 400 });
        }

        const { name, duration, categoryId, subcategory, image, shortDescription, pricing } = validation.data;

        const service = await Service.create({
            name,
            duration,
            categoryId,
            subcategory: subcategory || undefined, // Handle null from Zod
            image,
            shortDescription
        });

        // Handle Pricing
        if (Array.isArray(pricing)) {
            const pricingDoes = pricing.map((p: any) => ({
                serviceId: service._id,
                membershipId: p.membershipId, 
                price: Number(p.price)
            }));
            
            await ServicePricing.insertMany(pricingDoes);
        }

        // Revalidate cache
        revalidatePath('/');
        revalidatePath('/services');
        // Ideally we revalidate the specific subcategory page too, but we can't easily construct the dynamic path here 
        // without doing a DB lookup for category/subcategory names. 
        // Revalidating /services and / might be "good enough" for list views, 
        // but for the deep subcategory page we might need to be more aggressive or do the lookup.
        // Let's rely on Next.js revalidating broadly or path-based.
        // revalidatePath('/services/[category]/[subcategory]') might work if we knew the params.
        // For now, revalidate the layout/services generally. 
        // NOTE: Next.js revalidatePath with 'page' on dynamic routes works if we match the file path.
        revalidatePath('/services/[category]/[subcategory]', 'page'); 

        return NextResponse.json({ success: true, service });
    
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}

