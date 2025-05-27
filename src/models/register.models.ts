import mongoose from "mongoose";
import bcrypt from "bcryptjs";
enum Role {
  User = "user",
  Admin = "admin",
}
export type registerUserTypes = {
  _id: string;
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  imageFile: string;
};
const userSchema = new mongoose.Schema<registerUserTypes>({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default:Role.User
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  imageFile: {
    type: String,
  },
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});
export const User = mongoose.model<registerUserTypes>("User", userSchema);
