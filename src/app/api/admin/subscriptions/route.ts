import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Membership from "@/models/Membership"; // Ensure it's imported for populate
import { getPlanBenefits } from "@/lib/subscription-rules";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await connectDB();
        
        // Find users with active memberships
        // Filter by membershipExpiresAt > now? Or show all active/expired.
        // User wants "active subscriptions".
        const users = await User.find({ 
            membershipId: { $ne: null }
        }).populate("membershipId").lean();
        
        const subscriptions = users.map((user: any) => {
            const plan = user.membershipId;
            const benefitsConfig = getPlanBenefits(plan.name); // Using normalized Plan Name from schema
            
            // Build consumption map
            const usageMap = new Map();
            if (user.benefitsUsage) {
                user.benefitsUsage.forEach((u: any) => {
                    if (u.isConsumed) {
                         usageMap.set(u.benefitCode, u);
                    }
                });
            }

            const benefitsStatus = benefitsConfig.map((b: any) => {
                const consumption = usageMap.get(b.code);
                return {
                    ...b,
                    isConsumed: !!consumption,
                    consumedAt: consumption?.consumedAt,
                    consumedBy: consumption?.consumedByAdminId
                };
            });

            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    image: user.image
                },
                plan: {
                    name: plan.name,
                    expiresAt: user.membershipExpiresAt
                },
                benefits: benefitsStatus
            };
        });

        return NextResponse.json({ subscriptions });
    
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
}
