import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      index: true,
      lowerCase: true,
    },
    password: {
      type: String,
      required: true,    
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      index: true,
      lowerCase: true,
    },
    channelname: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      index: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
   return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next()
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password,this.password)

};


userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

export const User = mongoose.model("User", userSchema);
