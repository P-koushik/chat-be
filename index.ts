import express from "express";
import { env } from "./types/env";
import mongoose from "mongoose";
import { Conversation_routes } from "./routes/conversation";
import { User_routes } from "./routes/user";
import cors from "cors";

const app = express();

const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL].filter(
  (value): value is string => Boolean(value),
);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      console.log("Allowed origins:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "ngrok-skip-browser-warning",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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
