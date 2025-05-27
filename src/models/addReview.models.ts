import mongoose from "mongoose";
export type addReviewTypes = {
  userId: string;
  _id: string;
  
  name: string;
  // email: string;
  // phoneNumber: number;
  // interestedIn: string;
  message: string;
};
const addReviewSchema = new mongoose.Schema<addReviewTypes>(
  {
    userId: {
      type: String,
    },
    name: {
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
export const AddReview = mongoose.model<addReviewTypes>(
  "AddReview",
  addReviewSchema
);
