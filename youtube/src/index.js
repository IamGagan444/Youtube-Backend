import dotenv from "dotenv";
import { dbConnect } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

dbConnect()
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log("server listened successfully at 5000"),
    );
  })
  .catch((err) =>
    console.log("database connection failed while connecting it into server",err),
  );
