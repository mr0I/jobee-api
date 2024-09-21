import mongoose from "mongoose";
import { DB_URL } from "../config/configs.js";

export default async () => {
  return await mongoose.connect(DB_URL, {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4,
    connectTimeoutMS: 1000,
  });
};
