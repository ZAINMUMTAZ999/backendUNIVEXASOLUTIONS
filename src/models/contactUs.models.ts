import mongoose from "mongoose";
export type contactUsTypes = {
userId: string;
_id:string;
name: string;
email: string;
phoneNumber: number;
interestedIn: string;
message: string;

};
const contactUsSchema = new mongoose.Schema<contactUsTypes>(
  {
    userId: {
      type: String
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    interestedIn: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const ContactUs = mongoose.model<contactUsTypes>("ContactUs", contactUsSchema);
