
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Service from '@/models/Service';

import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const { name, image } = await req.json();
    
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const subcategory = await Subcategory.findByIdAndUpdate(
        params.id, 
        { name, image }, 
        { new: true }
    );

    if (!subcategory) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });

    revalidatePath('/services/[category]', 'page'); // Revalidate dynamic category pages (broad pattern or specific?)
    // Actually nextjs revalidatePath regex support is limited, we might just revalidate all paths or key paths
    revalidatePath('/'); 
    revalidatePath('/services');
    return NextResponse.json({ subcategory });
  } catch (err: any) {
    return NextResponse.json({ error: "Error updating subcategory" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    
    // Check for dependencies
    const serviceCount = await Service.countDocuments({ subcategory: params.id });
    if (serviceCount > 0) {
        return NextResponse.json({ error: `Cannot delete: This subcategory has ${serviceCount} services.` }, { status: 400 });
    }

    const subcategory = await Subcategory.findByIdAndDelete(params.id);

    if (!subcategory) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Error deleting subcategory" }, { status: 500 });
  }
}
