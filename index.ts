import express from "express";
import { env } from "./types/env";
import mongoose from "mongoose";
import { Conversation_routes } from "./routes/conversation";
import { User_routes } from "./routes/user";

const app = express();

app.use(express.json());

if (env.mongo_url !== "NA") {
  mongoose
    .connect(env.mongo_url)
    .then(() => console.log("Mongo db is connected"))
    .catch((error) => {
      console.log(error);
    });
} else {
  console.log("MongoDB URL not configured - running without database");
}

app.use("/api/v1", User_routes);
app.use("/api/v1", Conversation_routes);

app.listen(env.PORT, () => {
  console.log(`Server is running in port ${env.PORT}`);
});
