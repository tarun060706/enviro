import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();

export const connectDb = async () => {
  return mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Mongo Error", err));
};
