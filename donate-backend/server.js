import { configDotenv } from "dotenv";
import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import crypto from "crypto";

import { connectDb } from "./models/dbConfig.js";
import Donor from "./models/Donor.js";

configDotenv();

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount, name, email, phone } = req.body;
    const amountValue = Number(amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount required"
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amountValue * 100),
      currency: "INR",
      receipt: "donation_" + Date.now()
    });

    const record = await Donor.create({
      name,
      email,
      phone,
      amount: amountValue,
      orderId: order.id,
      status: "created"
    });

    console.log("record", record);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

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
    console.error("Verify error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get("/donors", async (req, res) => {
  try {
    const result = await Donor.find({});

    return res.status(200).json({
      success: true,
      message: "Donors fetch success",
      result: result || []
    });
  } catch (error) {
    res.status(500).send("<h1>Error fetching data, Try again later.</h1>");
  }
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log("Server running on http://localhost:" + PORT);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
  }
}

start();
