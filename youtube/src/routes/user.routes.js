import { Router } from "express";
import {
  changeAvatar,
  changeBanner,
  changeDetails,
  changePassword,
  getProfile,
  getUser,
  getWatchHistory,
  loginUser,
  logout,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  registerUser,
);

router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(verifyUser, logout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/get-currentuser").get(verifyUser, getUser);
router.route("/get-user-profile/:user_id").get(verifyUser, getProfile);
router.route("/get-watch-history").get(verifyUser, getWatchHistory);
router
  .route("/change-password")
  .post(verifyUser, upload.none(), changePassword);
router
  .route("/change-avatar")
  .post(verifyUser, upload.single("avatar"), changeAvatar);
router
  .route("/change-banner")
  .post(verifyUser, upload.single("banner"), changeBanner);
router.route("/change-user-details").post(verifyUser, changeDetails);

export default router;
