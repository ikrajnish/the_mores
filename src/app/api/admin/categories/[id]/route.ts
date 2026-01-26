
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ServiceCategory from '@/models/ServiceCategory';
import Subcategory from '@/models/Subcategory';
import Service from '@/models/Service';

import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const { name, image } = await req.json();
    
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const category = await ServiceCategory.findByIdAndUpdate(
        params.id, 
        { name, image }, 
        { new: true }
    );

    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    revalidatePath('/'); // Revalidate Home
    revalidatePath('/services'); // Revalidate Services List
    return NextResponse.json({ category });
  } catch (err: any) {
    return NextResponse.json({ error: "Error updating category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    
    // Check for dependencies
    const subCount = await Subcategory.countDocuments({ categoryId: params.id });
    if (subCount > 0) {
        return NextResponse.json({ error: `Cannot delete: This category has ${subCount} subcategories.` }, { status: 400 });
    }

    const serviceCount = await Service.countDocuments({ categoryId: params.id });
    if (serviceCount > 0) {
        return NextResponse.json({ error: `Cannot delete: This category has ${serviceCount} services.` }, { status: 400 });
    }

    const category = await ServiceCategory.findByIdAndDelete(params.id);

    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Error deleting category" }, { status: 500 });
  }
}
