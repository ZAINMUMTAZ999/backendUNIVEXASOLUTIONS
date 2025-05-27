import express, { Request, Response } from "express";
import { User } from "../models/register.models";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken";
  const JWT_SECRET_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
export const registerRouter = express.Router();
// export const adminRegisterRouter = express.Router();
registerRouter.post("/register", async (req, resp) => {
  const { email,role} = req.body;

  console.log("role",role)
  try {
    let user = await User.findOne({ email });
    if(user){
        resp.status(400).json({message:"User with this email already exists"});
        return
    };
    user=new User(req.body);
    console.log("body",req.body)
    await user.save();
 const token=   jwt.sign({userId:user.id},JWT_SECRET_KEY  , {
        expiresIn:"1d"
    });
    console.log("register_Token",token);
    resp.cookie("auth_token",token,{
      httpOnly: true,
      secure: true, // Must be true when sameSite is 'None'
      sameSite: 'none',
      maxAge: 86400000,
        
    });
    resp.status(200).json({user})
    console.log("user",user)

  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
});
registerRouter.get("/register",async(req:Request,resp:Response)=>{
  try {
   const registeredUser = await User.find().select("firstName");
    if(!registeredUser){
       resp.status(400).json({message:"Something Went Wrong!"});
        return;
    };
    resp.status(200).json({registeredUser})
    
  } catch (error) {
     console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
})
// registerRouter.get("/allRegisteredUser",async(req:Request,resp:Response)=>{
//   try {
//    const registeredUser = await User.findOne({userId:req.userId}).select("firstName").lean();
//     if(!registeredUser){
//        resp.status(400).json({message:"Something Went Wrong!"});
//         return;
//     };
//     resp.status(200).json(registeredUser)
    
//   } catch (error) {
//      console.log(error);
//     resp.status(500).json({ message: "Something Went Wrong" });
//   }
// })
registerRouter.get("/allRegisteredUser", async (req: Request, resp: Response) => {
  try {
    // Find all users and select only firstName field
    const allUsers = await User.find({}).select("firstName").lean();
    
    if (!allUsers || allUsers.length === 0) {
      resp.status(200).json({ 
        message: "No users found", 
        users: [],
        count: 0 
      });
      return;
    }
    
    // Extract just the firstName values into an array
    // const firstNames = allUsers.map(user => user.firstName).filter(name => name);
    
    resp.status(200).json({ 
      users: allUsers          // Full user objects with _id and firstName
      // firstNames: firstNames,    // Array of just the first names
      // count: allUsers.length 
    });
    
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
});
