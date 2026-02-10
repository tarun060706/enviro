import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then(mongooseInstance => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const donorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  amount: Number,
  paymentId: String,
  orderId: String,
  status: {
    type: String,
    default: "created"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Donor =
  mongoose.models.Donor || mongoose.model("Donor", donorSchema);
