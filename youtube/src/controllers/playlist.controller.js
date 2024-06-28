import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../model/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "playlist name is required");
  }
  const isPlaylistExist = await Playlist.findOne({ name });

  if (isPlaylistExist) {
    throw new ApiError(400, "playlist already exist");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });
  console.log("new playlist:", playlist);
  if (!playlist) {
    throw new ApiError(500, "something went wrong while creating playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"));
  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  const playlists = await Playlist.find({ owner: userId });

  if (!playlists) {
    throw new ApiError(400, "playlists not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlists }, "all playlists fetched successfully"),
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "playlist not found");
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "playlist data fetched successfully"),
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlist not found");
  }
  if (!videoId) {
    throw new ApiError(400, "video not found");
  }

  // Find the playlist by ID
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if the video already exists in the playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "video already exists in the playlist");
  }

  // Add the video to the playlist
  playlist.videos.push(videoId);
  await playlist.save({validateBeforeSave:false});

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId) {
    throw new ApiError(400, "playlist not found");
  }
  if (!videoId) {
    throw new ApiError(400, "video not found");
  }

  const playlistVideos = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, playlistVideos, "video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "playlist id not found");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "playlist id not found");
  }
  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    name,
    description,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
