import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../model/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) throw new ApiError(400, "Content is required");

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) throw new ApiError(400, "User id is required");

  const tweets = await Tweet.find({ owner: userId });

  if (!tweets) throw new ApiError(400, "tweets not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { tweets }, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) throw new ApiError(400, "tweet id is required");

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
