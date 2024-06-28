import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNARY_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

export const uploadCloudinary = async (localfile) => {
  console.log(localfile)
  // try {
    if (!localfile) {
     return null
    }
    const uploadResult = await cloudinary.uploader.upload(localfile, {
      resource_type: "auto",
    });
    fs.unlinkSync(localfile);
    return uploadResult;
  // } catch (error) {
  //   fs.unlinkSync(localfile);
  //   return null;
  // }
};
