import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../model/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Id");
  }

  // See if user has already subscription
  const isAlreadySubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (isAlreadySubscription) {
   const unSubscribed= await Subscription.findOneAndDelete({
      subscriber: req.user?._id,
      channel: channelId,
    });
    return res.status(200).json(
      new ApiResponse(200,unSubscribed, "UnSubscribed successfully", {
        Subscribed: false,
      }),
    );
  } else {
  const subscribed=  await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
    return res.status(200).json(
      new ApiResponse(200,subscribed, "subscribed successfully", {
        Subscribed: true,
      }),
    );
  }
});




// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "invalid channel id");
  }

  const subscribers = await Subscription.find({ channel: channelId });
  console.log("get all subsribers", subscribers);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers,
      },
      "all subscribers data fetched successfully",
    ),
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "invalid subscriber id");
  }

  const channels = await Subscription.find({ subscriber: subscriberId });

  console.log("subscribed channels:", channels);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channels,
      },
      "all subscribed channels data fetched successfully",
    ),
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
