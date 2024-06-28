import { Router } from "express";
import {
  creatComment,
  deleteComment,
  editComment,
  getVideoComments,
} from "../controllers/comment.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/get-video-comments/:videoId").get(getVideoComments);
router.route("/create-comment/:videoId").post(upload.none(), creatComment);
router.route("/edit-comment/:commentId").post(upload.none(),editComment);
router.route("/delete-comment/:commentId").get(deleteComment);

export default router;
