import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Database is connected");
  } catch (error) {
    console.log("Database is not connected");
    console.log(error.message);

    process.exit(1);
  }
};

export default connectDB;