import mongoose from "mongoose";

async function connectMongoDB() {
  await mongoose
    .connect(process.env.MONGODB_URI!, { dbName: "PropertyDb" })
    .then(() => {
      console.log("connected to db");
    })
    .catch((err) => {
      console.log("Can't connect to db", err);
    });
}

export default connectMongoDB;
