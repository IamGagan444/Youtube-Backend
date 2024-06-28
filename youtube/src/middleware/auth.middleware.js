import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


import jwt from "jsonwebtoken";
export const verifyUser = asyncHandler(async (req, _, next) => {
//  try {
  console.log(req.cookies)
     const token =
       req.cookies?.accessToken ||
       req?.headers("authorization").replace("Bearer", "");

     if (!token) {
       throw new ApiError(400, "unauthorized user access");
     }
   
     const decodedTOKEN =  jwt.verify(token, process.env.ACCESS_TOKEN);
     if (!decodedTOKEN) {
       throw new ApiError(400, "unauthorized user access");
     }
   
     const user = await User.findById(decodedTOKEN?._id).select(
       "-refreshToken",
     );
     if (!user) {
       throw new ApiError(400, "unauthorized user accesss");
     }
   
     req.user = user;
   
    next()
//  } catch (error) {
//      throw new ApiError(400,"invalid tokens")
    
//  }
});
