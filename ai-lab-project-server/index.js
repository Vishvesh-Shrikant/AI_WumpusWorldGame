import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js"; // Import the ES6 module routes
import { config } from "dotenv";
config();
const app = express();

// --- Middleware ---
const allowedOrigins = [
  "https://ai-wumpus-world-game.vercel.app", // your frontend domain
  "http://localhost:5173", // local dev (optional)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl/postman) or whitelisted domains
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you’re using cookies or auth
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
