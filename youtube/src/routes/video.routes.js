import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { getAllVideos, getVideoById, publishVideo, togglePublishStatus } from "../controllers/video.controller.js";

const router = Router();

router.use(verifyUser);

router.route("/publish-videos").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo,
);

router.route("/get-allvideos/:userId").get(getAllVideos)
router.route("/watch/:videoId").get(getVideoById)
router.route("/toggle-publish/:videoId").post(upload.none(),togglePublishStatus)

export default router;
