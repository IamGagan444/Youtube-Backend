import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Comment } from "../model/comments.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  try {
    const comments = await Comment.find({ video: videoId })
      .sort({ createdAt: -1 }) // sort by newest first
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    const totalComments = await Comment.countDocuments({ video:videoId });

    return res.status(200).json(
      new ApiResponse(200, {
        data: comments,
        pagination: {
          total: totalComments,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalComments / limit),
        },
      }),
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, error.message, "error while fetching comments"));
  }
});

const creatComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content) throw new Error("Content is required");
  if (!videoId) throw new Error("VideoId is required");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "something went wrong while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfully"));
});

const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId) {
    throw new ApiError(400, "commment id is required");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    },
  );

  if (!comment) throw new ApiError(500, "something went wrong while comment");

  return res.status(200).json(new ApiResponse(200, comment, "updated comment"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, " comment id is required ");
  }

  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment)
    throw new ApiError(500, "something went wrong while deleting comment");

  return res.status(200).json(new ApiResponse(200, comment, "deleted comment"));
});

export { creatComment, getVideoComments, editComment, deleteComment };
