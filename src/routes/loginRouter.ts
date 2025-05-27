import express, { Request, Response } from "express";
import { User } from "../models/register.models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken";
import { v2 as cloudinary } from "cloudinary";

// import { AddJobTypes } from "../models/addJob.models";
import multer from "multer";
import { AddBlog, addBlogTypes } from "../models/addBlog.models";
import { ContactUs, contactUsTypes } from "../models/contactUs.models";
import { authRoles } from "../middlewares/authRoles";
// import { Admin } from "mongodb";
import { AddReview, addReviewTypes } from "../models/addReview.models";

// export type jobSearchResponse = {
//   data: AddJobTypes[];
//   pagination: {
//     total: number;
//     page: number;
//     pages: number;
//   };
// };
const JWT_SECRET_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});
///images upload//
///images upload//
export async function uploadImages(
  imageBody: Express.Multer.File
): Promise<string> {
  try {
    // Check if imageBody exists and has buffer
    if (!imageBody || !imageBody.buffer) {
      throw new Error("No image file provided or invalid file");
    }

    // Convert the buffer to a base64 string
    const b64 = Buffer.from(imageBody.buffer).toString("base64");
    const dataURI = `data:${imageBody.mimetype};base64,${b64}`;
    // Upload the image to Cloudinary
    const res = await cloudinary.uploader.upload(dataURI);
    console.log("Cloudinary URL:", res.url);

    return res.url; // Return the URL from Cloudinary
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

const loginRouter = express.Router();

///LOGIN ///
loginRouter.post("/login", async (req: Request, resp: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) resp.status(400).json({ message: "Invalid Credentials!" });

    const isMatchPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!isMatchPassword)
      resp.status(400).json({ message: "Invalid Credentials!" });
    const token = jwt.sign(
      { userId: user?.id, role: user?.role },
      JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    console.log("role", user?.role);
    console.log(token);
    resp.cookie("auth_token", token, {
      httpOnly: true,
      secure: true, // Must be true when sameSite is 'None'
      sameSite: "none",
      maxAge: 86400000,
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // maxAge: 86400000,
    });

    resp.status(200).json({ userId: user?._id });
    console.log("userResponse", user);
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
});

// loginRouter.get(
//   "/validate-token",
//   verifyToken,
//   async (req: Request, resp: Response) => {
//     resp.status(200).send({ userId: req.userId });
//   }
// );
// In your backend loginRouter.ts
loginRouter.get(
  "/validate-token",
  verifyToken,
  async (req: Request, resp: Response) => {
    if (!req.user || !req.user.role) {
      // Optional: Add a check for robustness
      resp.status(401).send({ message: "User role not found in token" });
      return;
    } // Send back both userId and role
    resp.status(200).send({ userId: req.userId, role: req.user.role });
  }
);
// add blog  ////
// add blog  ////
// loginRouter.post(
//   "/addBlog",
//   verifyToken,
//   authRoles("admin"),
//   upload.single("imageFile"),
//   async (req: Request, resp: Response) => {
//     const body: addBlogTypes = req.body;
//     try {
//       const imageBody = req.file as Express.Multer.File;

//       // Check if file was uploaded
//       if (!imageBody) {
//         resp.status(400).json({ message: "Image file is required" });
//         return;
//       }

//       const imageUploaded = await uploadImages(imageBody);
//       body.imageFile = imageUploaded;
//       body.userId = req.userId;
//       const blog = await AddBlog.create(body);
//       if (!blog) {
//         resp.status(401).json("Invalid Credentails");
//         return;
//       }
//       await blog.save();
//       resp.status(200).send(blog);
//     } catch (error) {
//       console.log(error);
//       resp.status(500).json("Something Went Wrong");
//     }
//   }
// );
// In your addBlog route
loginRouter.post(
  "/addBlog",
  verifyToken,
  authRoles("admin"),
  upload.single("imageFile"),
  async (req: Request, resp: Response) => {
    const body: addBlogTypes = req.body;
    try {
      const imageBody = req.file as Express.Multer.File;

      if (!imageBody) {
        resp.status(400).json({ message: "Image file is required" });
        return;
      }

      const imageUploaded = await uploadImages(imageBody);
      body.imageFile = imageUploaded;
      body.userId = req.userId;
      
      // Set the custom date field if not provided
      if (!body.date) {
        body.date = new Date();
      }

      const blog = await AddBlog.create(body);
      if (!blog) {
        resp.status(401).json("Invalid Credentials");
        return;
      }
      
      // No need to call save() after create()
      resp.status(200).send(blog);
    } catch (error) {
      console.log(error);
      resp.status(500).json("Something Went Wrong");
    }
  }
);
// ContactUs  ////
// loginRouter.post("/contactUs",async(req:Request,resp:Response)=>{
//     const body:contactUsTypes=req.body;
//     try {

//       const info= await ContactUs.create(body);
//       // body.userId=req.userId
//       if(!info){
//         resp.status(401).json("Invalid Credentails");
//         return;
//       }
//       await info.save();
//       resp.status(200).send(info)
//     } catch (error) {
//       console.log(error);
//         resp.status(500).json("Something Went Wrong");
//     }
// });
loginRouter.post("/contactUs", async (req: Request, resp: Response) => {
  try {
    const body: contactUsTypes = req.body;

    // Ensure req.userId is available via middleware
    // body.userId = req.userId;

    const info = await ContactUs.create(body);

    resp.status(200).send(info);
  } catch (error) {
    console.error(error);
    resp.status(500).json("Something Went Wrong");
  }
});
// loginRouter.get("/contactUs", async (req: Request, resp: Response) => {
//   // const body:addBlogTypes=req.body;
//   try {
//     // const imageBody = req.file as Express.Multer.File;
//     // const imageUploaded =await  uploadImages(imageBody)
//     // body.imageFile= imageUploaded;
//     // body.userId=req.userId
//     const blog = await ContactUs.find();
//     if (!blog) {
//       resp.status(401).json("Invalid Credentails");
//       return;
//     }

//     resp.status(200).send(blog);
//   } catch (error) {
//     console.log(error);
//     resp.status(500).json("Something Went Wrong");
//   }
// });

// get blog  ////
// loginRouter.get(
//   "/blogs",
 
//   async (req: Request, resp: Response) => {
//     // const body:addBlogTypes=req.body;
//     try {
//       // const imageBody = req.file as Express.Multer.File;
//       // const imageUploaded =await  uploadImages(imageBody)
//       // body.imageFile= imageUploaded;
//       // body.userId=req.userId
//       const blog = await AddBlog.find();
//       if (!blog) {
//         resp.status(401).json("Invalid Credentails");
//         return;
//       }

//       resp.status(200).send(blog);
//     } catch (error) {
//       console.log(error);
//       resp.status(500).json("Something Went Wrong");
//     }
//   }
// );
// LOGOUT ////

loginRouter.post("/logout", (req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });
  res.status(200).json("user logged out");
});
//Get User Info
loginRouter.get(
  "/login",
  
  async (req: Request, resp: Response) => {
    // const body  = req.body;
    try {
      // Extract user ID from request
      // const id = req.userId;
      // console.log("Fetching user with ID:", id);

      // Fetch user with selected fields
      const user = await User.find({userId:req.userId}).select(
        "firstName"
      );
//  body.userId = req.userId;
      // Handle case where user is not found
      if (!user) {
        resp.status(404).json({ message: "User not found with this ID" });
      }

      // Send successful response
      resp.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  }
);
//Update User Info///
// loginRouter.put(
//   "/UpdateUser",
//   verifyToken,
//   upload.single("imageFile"),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { firstName, lastName } = req.body;
//       // const Body:AddJobTypes = req.body;
//       const userId = req.userId;

//       if (!userId) {
//         res.status(404).json({ message: "User ID not found" });
//         return;
//       }

//       const updates: { firstName?: string; lastName?: string } = {};
//       if (firstName) updates.firstName = firstName;
//       if (lastName) updates.lastName = lastName;

//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: updates },
//         { new: true }
//       );

//       if (!updatedUser) {
//         res.status(404).json({ message: "User not found" });
//         return;
//       }
//       if (req.file) {
//         const file = req.file as Express.Multer.File;
//         const updatedImageUrl = await uploadImages(file);

//         updatedUser.imageFile = updatedImageUrl;
//         await updatedUser.save();
//       }
//       res.status(200).json({ user: updatedUser });
//       return;
//     } catch (error) {
//       console.error("Error updating user:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

export type blogSearchResponse = {
  data: addBlogTypes[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};
// Get blogs route with both date options
loginRouter.get("/blogs", async (req: Request, resp: Response) => {
  try {
    const blogs = await AddBlog.find().sort({ date: -1, createdAt: -1 }); // Sort by custom date first, then createdAt
    
    if (!blogs) {
      resp.status(404).json({ message: "No blogs found" });
      return;
    }

    // Format dates for frontend
    const blogsWithFormattedDate = blogs.map(blog => ({
      ...blog.toObject(),
      formattedDate: (blog.date || blog.createdAt)?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      // Also provide raw dates for frontend flexibility
      displayDate: blog.date || blog.createdAt
    }));

    resp.status(200).json(blogsWithFormattedDate);
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
});

// Update search route
loginRouter.get("/search", async (req: Request, resp: Response) => {
  try {
    const query = constructSearchQuery(req.query);
    const pageSize = 4;
    const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (pageNumber - 1) * pageSize;

    const searchJob = await AddBlog.find(query)
      .sort({ date: -1, createdAt: -1 }) // Use both date fields for sorting
      .skip(skip)
      .limit(pageSize);

    const total = await AddBlog.countDocuments(query);

    const formattedBlogs = searchJob.map(blog => ({
      ...blog.toObject(),
      formattedDate: (blog.date || blog.createdAt)?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      displayDate: blog.date || blog.createdAt
    }));

    const response: blogSearchResponse = {
      data: formattedBlogs,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    resp.status(200).json(response);
  } catch (error) {
    console.error("Error in search route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

// loginRouter.get("/search", async (req: Request, resp: Response) => {
//   try {
//     // Construct the query
//     const query = constructSearchQuery(req.query);
//     // let sortOptions = {};
//     // switch (req.query.sortOption) {
//     //   // case "starRating":
//     //   //   sortOptions = { starRating: -1 }; //high to low  strRtaing
//     //   //   break;
//     //   case "pricePerNightAsc":
//     //     sortOptions = { pricePerNight: 1 }; // from low to high
//     //     break;
//     //   case "pricePerNightDesc":
//     //     sortOptions = { pricePerNight: -1 };
//     //     break;
//     //   case "salary_Asc":
//     //     sortOptions = { salary: 1 };
//     //     break;

//     //   case "salary_Desc":
//     //     sortOptions = { salary: -1 }; // High to low
//     //     break;
//     // }
//     // Pagination setup
//     const pageSize = 2; // Number of items per page
//     const pageNumber = parseInt(
//       req.query.page ? req.query.page.toString() : "1"
//     ); // Current page
//     const skip = (pageNumber - 1) * pageSize; // Skip items for pagination

//     // Fetch matching jobs
//     const searchJob = await AddBlog.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(pageSize);

//     // Total matching jobs count
//     const total = await AddBlog.countDocuments(query);

//     // Build response
//     const response: blogSearchResponse = {
//       data: searchJob,
//       pagination: {
//         total,
//         page: pageNumber,
//         pages: Math.ceil(total / pageSize),
//       },
//     };

//     resp.status(200).json(response);
//   } catch (error) {
//     console.error("Error in search route:", error);
//     resp.status(500).json({ message: "Internal Server Error" });
//   }
// });
export type contactUsResponse = {
  data: contactUsTypes[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};
// add review
loginRouter.post("/addReview", async (req: Request, resp: Response) => {
  try {
    const body: addReviewTypes = {
      ...req.body,
      
    };

    console.log("addReviewBody", body);

    const addReview = await AddReview.create(body);
    if (!addReview) {
       resp.status(404).json({ message: "Failed to add the review" })
       return;
    }

    resp.status(200).json(addReview);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
loginRouter.get("/addReview", async (req: Request, resp: Response) => {
  try {
    const Review = await AddReview.find();
    // console.log("reviewUserId",Review);
    if (!Review) {
       resp.status(404).json({ message: "Failed to add the review" })
       return;
    }

    resp.status(200).json(Review);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
loginRouter.get("/allReview", async (req: Request, resp: Response) => {
  try {
    const Review = await AddReview.find().sort({ createdAt: -1 });;
    // console.log("reviewUserId",Review);
    if (!Review) {
       resp.status(404).json({ message: "Failed to add the review" })
       return;
    }

    resp.status(200).json(Review);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

loginRouter.get("/contactUs",
    verifyToken,
  authRoles("admin"),
  
  async (req: Request, resp: Response) => {
  try {
    // Construct the query
    const query = constructSearchQuery(req.query);
    // let sortOptions = {};
    // switch (req.query.sortOption) {
    //   // case "starRating":
    //   //   sortOptions = { starRating: -1 }; //high to low  strRtaing
    //   //   break;
    //   case "pricePerNightAsc":
    //     sortOptions = { pricePerNight: 1 }; // from low to high
    //     break;
    //   case "pricePerNightDesc":
    //     sortOptions = { pricePerNight: -1 };
    //     break;
    //   case "salary_Asc":
    //     sortOptions = { salary: 1 };
    //     break;

    //   case "salary_Desc":
    //     sortOptions = { salary: -1 }; // High to low
    //     break;
    // }
    // Pagination setup
    const pageSize = 4; // Number of items per page
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    ); // Current page
    const skip = (pageNumber - 1) * pageSize; // Skip items for pagination

    // Fetch matching jobs
    const searchContact = await ContactUs.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Total matching jobs count
    const total = await ContactUs.countDocuments(query);

    // Build response
    const response: contactUsResponse = {
      data: searchContact,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    resp.status(200).json(response);
  } catch (error) {
    console.error("Error in search route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.title) {
    constructedQuery.title = new RegExp(queryParams.title, "i"); // Case-insensitive partial match
  }

  return constructedQuery;
};

export { loginRouter };
