import { configDotenv } from "dotenv"; // ✅ MUST be on top

import express from "express" 
import Razorpay from "razorpay"
import cors  from "cors"
import { connectDb } from "./models/dbConfig.js";
import Donor from "./models/Donor.js";

configDotenv();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// create order + save donation
app.post("/create-order", async (req, res) => {
  try {
    const { amount, name, email, phone } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    // create razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "donation_" + Date.now(),
    });

    // save to DB (pending)
    const record = await Donor.create ({
      name,
      email,
      phone,
      amount,
      orderId: order.id,
      status: "created"
    });

    
    console.log('record', record)

    res.json({ success: true, order });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/donors", async (req, res) => {
  try {
    const result = await Donor.find({});
    if(!result) {
     return res.status(200).send("<h1> No donators found!. </h1>");
    }
    return res.status(200).json({message:"Donors fetch success", result});
  } catch (error) {
    res.status(500).send("<h1>Error fetching data, Try again later.</h1>")
  }
})

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb(); // ✅ connect MongoDB first
    app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server running on http://0.0.0.0:" + PORT);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
  }
}

start();
