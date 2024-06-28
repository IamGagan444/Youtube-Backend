import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle-videolikes/:videoId").get(toggleVideoLike);
router.route("/toggle-commentlikes/:commentId").get(toggleCommentLike);
router.route("/toggle-tweetlikes/:tweetId").get(toggleTweetLike);
router.route("/get-liked-videos/:userId").get(getLikedVideos)


export default router;



