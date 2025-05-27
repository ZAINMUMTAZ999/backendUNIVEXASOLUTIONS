import express, { Request, Response } from "express";
import multer, { memoryStorage } from "multer";
// import { v2 as cloudinary } from "cloudinary";
import cloudinary from "cloudinary";
import { verifyToken } from "../middlewares/verifyToken";
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

const imageUpload = async (req: Request, resp: Response) => {
  const image = req.file as Express.Multer.File;
  try {
    const b64 = Buffer.from(image.buffer).toString("base64");
    console.log(b64)
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    console.log("imageResponse", res);
    res.url;
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
};
export {
    imageUpload
}