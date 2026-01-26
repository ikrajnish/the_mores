
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import Subcategory from '@/models/Subcategory';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');

  const query = categoryId ? { categoryId } : {};
  const subcategories = await Subcategory.find(query).populate('categoryId').sort({ name: 1 });
  
  return NextResponse.json({ subcategories });
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, categoryId, image } = await req.json();
    
    if (!name || !categoryId) {
        return NextResponse.json({ error: "Name and Category ID are required" }, { status: 400 });
    }

    const subcategory = await Subcategory.create({ name, categoryId, image });
    revalidatePath('/');
    revalidatePath('/services');
    return NextResponse.json({ subcategory }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Subcategory already exists in this category" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error creating subcategory" }, { status: 500 });
  }
}
