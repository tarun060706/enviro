import { connectDb, Donor } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDb();
    const result = await Donor.find({});

    if (!result || result.length === 0) {
      return res.status(200).send("<h1>No donators found!</h1>");
    }

    return res.status(200).json({
      message: "Donors fetch success",
      result
    });
  } catch (error) {
    return res.status(500).send("<h1>Error fetching data, Try again later.</h1>");
  }
}
