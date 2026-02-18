
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/Service";
import ServicePricing from "@/models/ServicePricing";
import Membership from "@/models/Membership";
import { ServiceDTO, ApiErrorDTO } from "@/types";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params; // Ensure strict await of constraints
    await connectDB();

    const service = await Service.findById(id).lean();
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const normalMembership = await Membership.findOne({ name: "NORMAL" }).lean();
    let price = 0;
    if (normalMembership) {
        const pricing = await ServicePricing.findOne({
            serviceId: service._id,
            membershipId: normalMembership._id
        }).lean();
        if (pricing) price = pricing.price;
    }

    // Explicitly map to DTO to ensure strictness
    const serviceDTO: ServiceDTO = {
        _id: service._id.toString(),
        name: service.name,
        duration: service.duration,
        image: service.image,
        categoryId: service.categoryId.toString(),
        price,
        shortDescription: service.shortDescription
    };

    return NextResponse.json(serviceDTO);
  } catch (error) {
    console.error("Fetch Service Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
