import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
         if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { userId, benefitCode, isConsumed, notes } = body;

        if (!userId || !benefitCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        // Find existing usage or create new
        let usage = user.benefitsUsage.find((u: any) => u.benefitCode === benefitCode);
        
        if (isConsumed) {
            if (usage && usage.isConsumed) {
                return NextResponse.json({ message: "Already consumed" });
            }
            if (!usage) {
                user.benefitsUsage.push({
                    benefitCode,
                    isConsumed: true,
                    consumedAt: new Date(),
                    consumedByAdminId: session.user.id,
                    notes: notes || "Admin action"
                });
            } else {
                usage.isConsumed = true;
                usage.consumedAt = new Date();
                usage.consumedByAdminId = session.user.id;
                if (notes) usage.notes = notes;
            }
        } else {
            // Un-consume (Reset)
             if (usage) {
                usage.isConsumed = false;
                usage.consumedAt = undefined;
                usage.consumedByAdminId = undefined;
                usage.notes = undefined;
                // Or remove from array entirely? Keeping track is safer if we want 'unconsumed' history, but 'isConsumed' false means available.
                // Keeping it is fine as long as logic checks isConsumed.
             }
        }
        
        user.markModified('benefitsUsage');
        await user.save();
        
        return NextResponse.json({ success: true, benefitsUsage: user.benefitsUsage });

    } catch (error) {
        console.error("Error updating benefit status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
