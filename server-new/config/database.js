import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    console.log("MongoDB URI:", process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
