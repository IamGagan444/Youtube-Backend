import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../model/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  
  if (!isValidObjectId(videoId)) {
    throw new ApiResponse(400, "videoId is required");
  }

  const isAlreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    await Like.findOneAndDelete({
      video: videoId,
      likedBy: req.user?._id,
    });
    return res.status(200).json(new ApiResponse(200, "video unliked"));
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    return res.status(200).json(new ApiResponse(200, "video liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is required");
  }

  const isCommentLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (isCommentLiked) {
    await Like.findOneAndDelete({
      comment: commentId,
      likedBy: req.user?._id,
    });
    return res.status(200, "comment unliked successfully");
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }

  const isTweetLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (isTweetLiked) {
    await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "tweet unlike successully"));
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "tweet liked successully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { userId } = req.params;

  if (!isValidObjectId(userId)) throw new ApiError(400, "user id is required");

  const likes = await Like.find({ likedBy: req.user?._id }).populate("video");

  const likedVideos = likes
    .filter((like) => like?.video)
    .map((like) => like.video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully"),
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
