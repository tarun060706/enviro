import { default as mongoose } from "mongoose";


const donorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  amount: Number,
  paymentId: String,
  orderId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Donor", donorSchema);
