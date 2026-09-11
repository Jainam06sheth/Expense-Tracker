import "dotenv/config";

import app from "./app.js";
import connect_Database from "./config/db.config.js";

connect_Database();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});