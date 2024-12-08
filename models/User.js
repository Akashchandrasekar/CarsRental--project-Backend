import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Added custom error message
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"], // Added custom error message
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "user"], // Restricts values to "admin" or "user"
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const User = mongoose.model("User", userSchema);
export default User;
