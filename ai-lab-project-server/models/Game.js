import mongoose from "mongoose";
const { Schema } = mongoose; // Destructuring Schema from mongoose is a common modern practice

// This schema must capture all state from your classes
const GameSchema = new Schema({
  // Folly State
  grid: { type: Object, required: true },
  agentPos: { type: Object, required: true },
  exitPos: { type: Object, required: true },
  collapsePos: { type: Object, required: true },
  gameOver: { type: Boolean, default: false },
  gameWon: { type: Boolean, default: false },

  // KBA State
  kba_kb: { type: Object, required: true },
  kba_visited: { type: [String], required: true }, // Store the Set as an array of keys
  kba_frontier: { type: [Object], required: true },

  // Optimizer State
  optimizer_temp: { type: Number, required: true },

  // Game/User Info
  createdAt: { type: Date, default: Date.now },
  lastMoveAt: { type: Date, default: Date.now },
  moveCount: { type: Number, default: 0 },
});

export default mongoose.model("Game", GameSchema);
