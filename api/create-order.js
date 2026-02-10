import Razorpay from "razorpay";
import { connectDb, Donor } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDb();

    const { amount, name, email, phone } = req.body || {};
    const amountValue = Number(amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount required"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountValue * 100),
      currency: "INR",
      receipt: "donation_" + Date.now()
    });

    await Donor.create({
      name,
      email,
      phone,
      amount: amountValue,
      orderId: order.id,
      status: "created"
    });

    return res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
