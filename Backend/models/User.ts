import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter your name"],
    },
    email: {
      type: String,
      required: [true, "PLease Enter  your email"],
    },
    googleId: { type: String, required: false, unique: false },
    
    password: {
      type: String,
      required: function (this: any) {
        return !this.googleId; // Password required only if Google ID is missing
      },
    }
  },
);
const Users = mongoose.models?.users || mongoose.model("users", userSchema);
export default Users;
