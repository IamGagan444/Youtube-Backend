import mongoose, { Schema } from "mongoose";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, channelname, fullname } = req.body;

  const fieldsName = [
    "email",
    "username",
    "password",
    "channelname",
    "fullname",
  ];

  const emptyFields = fieldsName.filter((field) => !req.body[field]?.trim());

  if (emptyFields.length > 0) {
    throw new ApiError(
      400,
      `${emptyFields.join(", ")} ${emptyFields.length > 1 ? "are" : "is"} required`,
    );
  }

  const isUserExist = await User.findOne({
    $or: [{ email }, { channelname }, { username }],
  });
  console.log("is user exist", isUserExist);
  if (isUserExist) {
    throw new ApiError(400, "User already exists with these credentials");
  }

  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const bannerLocalPath = req.files?.banner[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const banner = await uploadCloudinary(bannerLocalPath);

  if (!avatar?.url) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    email,
    fullname,
    channelname,
    username,
    password,
    avatar: avatar.url,
    banner: banner?.url || "",
  });

  await user.save();
  console.log("new register user:", user);
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { createdUser }, "User registered successfully"),
    );
});

const genrateTokens = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "token generation failed");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(400, "User not found");
  }
  console.log("user:", user);

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "you have entered wrong password");
  }

  const { accessToken, refreshToken } = await genrateTokens(user._id);

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "token generation failed");
  }

  const userDetails = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { userDetails, accessToken, refreshToken },
        "user loggedin successfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log(req);
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    throw new ApiError(400, "unauthorized user access");
  }

  const decodedToken = await jwt.verify(
    incomingToken,
    process.env.REFRESH_TOKEN,
  );
  if (!decodedToken) {
    throw new ApiResponse(400, "invalid tokens");
  }
  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(400, "unauthorized user");
  }

  if (incomingToken !== user?.refreshToken) {
    throw new ApiResponse(400, "invalid user access");
  }

  const { accessToken, refreshToken } = await genrateTokens(user);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "tokens are generated successfully ",
      ),
    );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;
  console.log(req)

  const fields = ["oldPassword", "newPassword", "confPassword"];
  const emptyFields = fields.filter((field) => !req.body[field]?.trim());

  if (emptyFields.length > 0) {
    throw new ApiError(
      400,
      `${emptyFields.join(", ")} ${emptyFields.length > 0 ? "are" : "is"} required! `,
    );
  }

  if (newPassword !== confPassword) {
    throw new ApiError(400, "passwords do not match");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "unauthorized user access");
  }

  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "you have entered wrong password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed successfully"));
});

const changeDetails = asyncHandler(async (req, res) => {
  const { channelname, fullname, username } = req.body;

  if (!channelname && !fullname && !username) {
    throw new ApiError(400, "no field to update");
  }

  const updatedFileds = {};
  if (username) updatedFileds.username = username;
  if (fullname) updatedFileds.fullname = fullname;
  if (channelname) updatedFileds.channelname = channelname;

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updatedFileds,
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "details updated successfully"));
});

const changeAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.avatar[0];
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar upload failed");
  }

  await User.findOneAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  );
});

const changeBanner = asyncHandler(async (req, res) => {
  const bannerLocalPath = req.file.banner[0];

  if (!bannerLocalPath) {
    throw new ApiError(400, "banner is required to change");
  }
  const banner = await uploadCloudinary(bannerLocalPath);

  if (!banner) {
    throw new ApiError(400, "banner upload failed");
  }
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        banner: banner.url,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(400, "banner changed successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
  const { user_id } = req.params;


  if (!user_id) {
    throw new ApiError(400, "user not found");
  }

  const channel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(user_id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "ihv_subscribed",
      },
    },
    {
      $addFields: {
        subscriber_count: { $size: "$subscribers" },
        ihv_subscribeed: { $size: "$ihv_subscribed" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullname: 1,
        channelname: 1,
        avatar: 1,
        banner: 1,
        subscriber_count: 1,
        ihv_subscribeed: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel) {
    throw new ApiError(400, "channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    // {
    //   $lookup: {
    //     from: "videos",
    //     localField: "watchHistory",
    //     foreignField: "_id",
    //     as: "watchHistory",
    //     // pipeline: [
    //     //   {
    //     //     $lookup: {
    //     //       from: "users",
    //     //       localField: "owner",
    //     //       foreignField: "_id",
    //     //       as: "owner",
    //     //       pipeline: [
    //     //         {
    //     //           $project: {
    //     //             username: 1,
    //     //             avatar: 1,
    //     //             fullname: 1,
    //     //             channelname: 1,
    //     //           },
    //     //         },
    //     //       ],
    //     //     },
           
    //     //   },
    //     //   {
    //     //     $addFields:{
    //     //       owner:{
    //     //         $first:"$owner"
    //     //       }
    //     //     }
    //     //   }
    //     // ],
    //   },
    // },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, watchHistory, "watch history fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  changePassword,
  changeDetails,
  changeAvatar,
  getUser,
  changeBanner,
  getProfile,
  getWatchHistory,
};
