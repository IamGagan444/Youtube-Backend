import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = Router()
router.route("/toggle-subscribe/:channelId").post(verifyUser,toggleSubscription)
router.route('/get-allsubscribers/:channelId').get(getUserChannelSubscribers)
router.route("/get-subscribed-channels/:subscriberId").get(getSubscribedChannels)


export default router;


