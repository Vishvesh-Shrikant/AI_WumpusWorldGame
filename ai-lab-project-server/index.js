import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js"; // Import the ES6 module routes
import { config } from "dotenv";
config();
const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json()); // Body parser for JSON

// --- DB Config ---
// Add your MongoDB connection string
const db = process.env.MONGODB_URI || "YOUR_MONGO_DB_CONNECTION_STRING";
mongoose
  .connect(db) // useNewUrlParser and useUnifiedTopology are no longer needed
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// --- API Routes ---
app.use("/api/games", gameRoutes); // Use the imported routes

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("Architects Folly API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
