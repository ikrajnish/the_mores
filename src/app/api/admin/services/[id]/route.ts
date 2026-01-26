import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";

export async function PUT(
    req: NextRequest, 
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;

    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        const body = await req.json();
        const { name, duration, categoryId, image, shortDescription, pricing } = body;
        // pricing: [{ membershipId, price }]

        const service = await Service.findByIdAndUpdate(id, {
            name,
            duration,
            categoryId,
            image,
            shortDescription
        }, { new: true });

        if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

        // Update Pricing
        if (Array.isArray(pricing)) {
            // Loop through and update/upsert
            for (const p of pricing) {
                await ServicePricing.findOneAndUpdate(
                    { serviceId: service._id, membershipId: p.membershipId },
                    { price: Number(p.price) },
                    { upsert: true, new: true }
                );
            }
        }

        // Revalidate cache
        revalidatePath('/');
        revalidatePath('/services');
        revalidatePath('/services/[category]/[subcategory]', 'page');

        return NextResponse.json({ success: true, service });
    
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}

export async function DELETE(
    req: NextRequest, 
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;

    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        await Service.findByIdAndDelete(id);
        await ServicePricing.deleteMany({ serviceId: id });

        // Revalidate cache
        revalidatePath('/');
        revalidatePath('/services');
        revalidatePath('/services/[category]/[subcategory]', 'page');

        return NextResponse.json({ success: true });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
