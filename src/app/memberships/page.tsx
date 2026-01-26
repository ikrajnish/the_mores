import connectDB from "@/lib/db";
import Membership from "@/models/Membership";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MembershipList } from "@/components/MembershipList";

// Define interface for what we pass to client
// Ensure properties match simple types for serialization
interface IMem {
    _id: string;
    name: string;
    price: number;
    description: string;
    benefits: string[];
}

export default async function MembershipPage() {
  await connectDB();
  
  // Fetch tiers
  const membershipsData = await Membership.find({ 
      name: { $in: ['SILVER', 'GOLD', 'PLATINUM'] } 
  }).sort({ price: 1 }).lean();

  // Convert to plain objects / fix serialization issues (like ObjectId)
  const memberships: IMem[] = JSON.parse(JSON.stringify(membershipsData));

  return (
      <div className="min-h-screen flex flex-col">
          <Navbar />
          <MembershipList memberships={memberships} />
          <Footer />
      </div>
  );
}
