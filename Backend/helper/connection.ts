import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const Connectdb = async () => {
  try {
    const mongoDbUrl = process.env.MONGODB_URI!;
    if (!mongoDbUrl) {
      throw new Error(
        "MONGO_DB_URL is not defined in the environment variables"
      );
    }
    const connection = await mongoose.connect(mongoDbUrl, {
      dbName: "PropertyDb",
    });
    console.log("Connected to database", connection.connection.name);
  } catch (err) {
    console.log(err);
  }
};

export default Connectdb;
