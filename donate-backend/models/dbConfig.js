import { configDotenv } from "dotenv"; // ✅ MUST be on top
import { default as mongoose } from "mongoose";

configDotenv();

export const connectDb = async () => {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error ❌", err));
}