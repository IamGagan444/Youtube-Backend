import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb", strict: true }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(morgan("combined"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likesRouter from "./routes/likes.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";

app.use("/api", userRouter);
app.use("/api", videoRouter);
app.use("/api", subscriptionRouter);
app.use("/api", playlistRouter);
app.use("/api", likesRouter);
app.use("/api", tweetRouter);
app.use("/api", commentRouter);
