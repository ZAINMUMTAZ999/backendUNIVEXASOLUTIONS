import mongoose from "mongoose";
export type addBlogTypes = {
userId: string;
_id:string;
title: string;
description: string;
imageFile: string;
textEditor: string;
date:Date;
  createdAt?: Date; 
  updatedAt?: Date;

};
const BlogSchema = new mongoose.Schema<addBlogTypes>(
  {
    userId: {
      type: String
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    textEditor: {
      type: String,
      // required: true,
    },
     date: {
      type: Date,
      default: Date.now, // Set default to current date if not provided
    },
    imageFile: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);
export const AddBlog = mongoose.model<addBlogTypes>("addedBlogs", BlogSchema);
