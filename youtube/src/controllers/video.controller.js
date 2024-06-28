import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../model/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { User } from "../model/user.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const videos = await Video.find()
    .limit(limit)
    .skip((page - 1) * limit);

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "videos data fetched successfully"));

  //TODO: get all videos based on query, sort, pagination
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const fields = ["title", "description"];
  const emptyFields = fields.filter((field) => !req.body[field]?.trim());
  if (emptyFields.length > 0) {
    throw new ApiError(
      400,
      `${emptyFields.join(",")} ${emptyFields.length > 1 ? "are" : "is"} required `,
    );
  }

  if (!req.files) {
    throw new ApiError(400, "video and thumbnail are required");
  }
  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "video is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const video = await uploadCloudinary(videoLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(500, "video upload failed");
  }
  if (!thumbnail?.url) {
    throw new ApiError(500, "thumbnail upload failed");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoFile: video?.url,
    thumbnail: thumbnail?.url,
    duration: video?.duration,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { newVideo }, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  // const isPublishedFORuser= await Video.findOne({});

  //using aggrigation i need to find
  // total subscribers
  //total likes
  //think about dislikes also not mandotory
  //
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "video",
        localField: "_id",
        as: "totalLikes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "totalSubscribers",
      },
    },
    {
      $addFields: {
        totalLikes: {
          $size: "$totalLikes",
        },
        totalSubscribers: {
          $size: "$totalSubscribers",
        },
      },
    },
    // {
    //   $project: {
    //     owner: 1,
    //     videoFile: 1,
    //     thumbnail: 1,
    //     duration: 1,
    //     description: 1,
    //     title: 1,
    //     views: 1,
    //     isPublished: 1,
    //     totalLikes: 1,
    //     totalSubscribers:1
    //   },
    // },
  ]);

  console.log(video);

  if (!video) {
    throw new ApiError(400, "video not found");
  }

  if (
    !video[0].isPublished &&
    video[0]?.owner?.toString() !== req.user?._id?.toString()
  ) {
    throw new ApiError(400, "video is not published");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $push: {
        watchHistory: videoId,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "videoid is required");
  }
  if (!req.files) {
    throw new ApiError(400, "video and thumbnail is required");
  }

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "video is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }
  const video = await uploadCloudinary(videoLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);

  if (video?.url) {
    throw new ApiError(500, "video upload failed");
  }
  if (thumbnail?.url) {
    throw new ApiError(500, "thumbnail upload failed");
  }

  const newVideo = await video.findByIdAndUpdate(videoId, {
    $set: {
      videoFile: video?.url,
      thumbnail: thumbnail?.url,
      duration: video?.duration,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { newVideo }, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    new ApiError(400, "video id is required");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, "video deleted succssfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    new ApiError(400, "video id is required");
  }

  const video = await Video.findById(videoId);

  if (video?.owner !== req.user?._id) {
    throw new ApiError(400, "this video is not yours");
  }

  if (!video) {
    throw new ApiError(400, "video not found");
  } else {
    const updateVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: !video?.isPublished,
        },
      },
      {
        new: true,
      },
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updateVideo },
          "video status updated successfully",
        ),
      );
  }
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
