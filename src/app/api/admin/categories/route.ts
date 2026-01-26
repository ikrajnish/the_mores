
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import ServiceCategory from '@/models/ServiceCategory';

export async function GET() {
  await connectDB();
  const categories = await ServiceCategory.find({}).sort({ name: 1 });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, image } = await req.json();
    
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const category = await ServiceCategory.create({ name, image });
    revalidatePath('/');
    revalidatePath('/services');
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error creating category" }, { status: 500 });
  }
}
