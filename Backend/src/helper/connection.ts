import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const Connectdb = async () => {
  try {
    const connection= await mongoose.connect(process.env.MONGO_DB_URL,{
      dbName:"PropertyDb"
    });
    console.log("Connected to database",connection.connection.name);

  } catch (err) {
    console.log(err);
  }
};
