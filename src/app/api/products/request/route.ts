import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ProductRequest from "@/models/ProductRequest";
import Product from "@/models/Product";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { productId, userPhone } = body;

    if (!productId || !userPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
       return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Optional: link to user if logged in or found by phone
    let userId: any = undefined;
    if (session?.user) {
         const user = await User.findOne({ phone: session.user.email });
         if (user) userId = user._id;
    } else {
         const user = await User.findOne({ phone: userPhone });
         if (user) userId = user._id;
    }

    const payload: any = {
      productId,
      userPhone,
      status: 'PENDING'
    };
    
    if (userId) {
        payload.userId = userId;
    }

    const request = await ProductRequest.create(payload);

    // TODO: Notify admin (e.g., via Email or SMS)
    // console.log(`[Notification] Admin alerted for product request: ${product.name} from ${userPhone}`);

    return NextResponse.json({ success: true, requestId: request._id }, { status: 201 });
  } catch (error) {
    console.error("Product Request API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
