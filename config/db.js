import mongoose from "mongoose";

const connection = () => {
  mongoose
    .connect(process.env.DB_URL, {
      autoIndex: false, // Don't build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4,
      connectTimeoutMS: 1000,
    })
    .then((conn) => {
      console.log(`Mongodb Connected on ${conn.connection.host} `);
    })
    .catch((err) => {
      console.error(err);
    });
};

export { connection as ConnectDb };
