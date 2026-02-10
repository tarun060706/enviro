import crypto from "crypto";
import { connectDb, Donor } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDb();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expected === razorpay_signature;

    await Donor.updateOne(
      { orderId: razorpay_order_id },
      {
        $set: {
          paymentId: razorpay_payment_id,
          status: isValid ? "paid" : "failed"
        }
      }
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Signature mismatch"
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
