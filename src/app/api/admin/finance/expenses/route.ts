import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        // Fetch expenses (and maybe other manual transactions?)
        // For now just EXPENSE type
        const expenses = await Transaction.find({ type: 'EXPENSE' }).sort({ date: -1 }).limit(50);

        return NextResponse.json({ expenses });
    
      } catch (error) {
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
        const { description, amount, date } = body;

        if (!description || !amount) {
            return NextResponse.json({ error: "Description and Amount are required" }, { status: 400 });
        }

        const transaction = await Transaction.create({
            type: 'EXPENSE',
            amount: Number(amount),
            description,
            date: date ? new Date(date) : new Date(),
            userId: session.user.userId
        });

        return NextResponse.json({ success: true, transaction });
    
      } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
