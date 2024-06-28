import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.route("/create-playlist").post(upload.none(), createPlaylist);
router.route("/get-playlists/:userId").get(getUserPlaylists);
router.route("/get-playlist/:playlistId").get(getPlaylistById);
router.route("/playlist/:playlistId/video/:videoId").get(addVideoToPlaylist);
router
  .route("/remove-playlist/:playlistId/video/:videoId")
  .get(removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").get(deletePlaylist);
router.route("/update-playlist/:playlistId").get(updatePlaylist);

export default router;
