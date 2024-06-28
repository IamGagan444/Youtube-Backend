import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.route("/create-tweet").post(upload.none(), createTweet);
router.route("/get-user-tweets").get(getUserTweets);
router.route("/update-tweets").post(updateTweet);
router.route("/delete-tweet").get(deleteTweet);

export default router;
