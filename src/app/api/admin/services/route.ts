import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import ServiceCategory from "@/models/ServiceCategory"; // Ensure this model exists

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        const services = await Service.find().populate('categoryId').lean();
        const pricing = await ServicePricing.find({ serviceId: { $in: services.map((s: any) => s._id) } }).populate('membershipId').lean();
        const categories = await ServiceCategory.find().lean();
        
        // Combine pricing into services? Or send separate?
        // Let's send separate and combine on frontend for flexibility or edit mode.
        
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
        const { name, duration, categoryId, image, shortDescription, pricing } = body;
        // pricing should be array of { membershipId, price }

        if (!name || !duration || !categoryId) {
            return NextResponse.json({ error: "Name, Duration, and Category are required" }, { status: 400 });
        }

        const service = await Service.create({
            name,
            duration,
            categoryId,
            image,
            shortDescription
        });

        // Handle Pricing
        if (Array.isArray(pricing)) {
            const pricingDoes = pricing.map((p: any) => ({
                serviceId: service._id,
                membershipId: p.membershipId, // logic to handle 'NORMAL' if strictly using IDs. 
                // Front end should send valid membershipIds. 
                price: Number(p.price)
            }));
            
            // Delete existing just in case (though new service shouldn't have any)
            await ServicePricing.insertMany(pricingDoes);
        }

        return NextResponse.json({ success: true, service });
    
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
