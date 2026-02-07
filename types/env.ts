import dotenv from "dotenv";
dotenv.config();

type TEnv = {
  PORT: number;
  mongo_url: string | "NA";
};

export const env: TEnv = {
  PORT: parseInt(process.env.PORT || "8000"),
  mongo_url: process.env.MONGO_URL || "NA",
};
