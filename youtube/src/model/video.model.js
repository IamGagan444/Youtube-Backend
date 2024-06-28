import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"



const videoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    views: {
      type: Number,
    },
    isPublished: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true },
);

videoSchema.plugin(aggregatePaginate)


export const Video = mongoose.model("Video",videoSchema)
