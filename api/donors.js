import { connectDb, Donor } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDb();
    const result = await Donor.find({});
    return res.status(200).json({
      success: true,
      message: "Donors fetch success",
      result: result || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching data, try again later.",
      result: []
    });
  }
}
