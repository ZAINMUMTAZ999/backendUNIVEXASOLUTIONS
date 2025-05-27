import express,{Router} from "express";
import serverless from "serverless-http";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import {  registerRouter } from "../src/routes/registerRouter";
import { loginRouter } from "../src/routes/loginRouter";
import {v2 as cloudinary} from "cloudinary";

  const MONGODB_URL="mongodb+srv://mzainmumtaz99:zain123321123321@cluster0.vut2rqf.mongodb.net/"
// zain123321123321

const app = express();
app.use(express.json());
const router = Router();

mongoose
  .connect(MONGODB_URL)
  .then(() => console.log("Database connected successfully"))
  .catch(error => {
    console.error("Database connection error:", error);
    // Continue execution even if DB connection fails
  });

// Middleware
app.use(
  cors({
    origin:  "http://localhost:5173",
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URLNETLIFY  ||  "http://localhost:5173",
//     credentials: true,
//   })
// );

// Cloudinary config
cloudinary.config({ 
  cloud_name: "zainmughal999", 
  api_key:"744766614756274", 
  api_secret: "F5uKFc-wILFbT2CW44eUJzDV8o8"
});
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/v1", registerRouter);
app.use("/v2", loginRouter);

// router.use("/v1", registerRouter);
// router.use("/v2", loginRouter);
app.use("/.netlify/functions/api", router);


app.listen(8000, ()=>{
  // if (err) console.log("Error in server setup")
  console.log("Server listening on Port 8000");
})
// Export the serverless handler
// const handler = serverless(app);
// console.log("handler",handler);
// export { handler };

// mzainmumtaz99
// P8YtfI7Uvtj64vuv