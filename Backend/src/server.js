import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/`);
});