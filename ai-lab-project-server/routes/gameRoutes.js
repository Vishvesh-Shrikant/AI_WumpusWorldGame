import express from "express";
import {
  getGame,
  createGame,
  takeTurn,
  deleteGame,
} from "../controller/gameController.js"; // Also, added .js extension, which is often needed in Node ES modules

const router = express.Router();
/**
 * @route   POST /api/games
 * @desc    Create a new game session
 * @access  Public
 */
router.post("/", createGame);

/**
 * @route   GET /api/games/:gameId
 * @desc    Get the current state of a game
 * @access  Public
 */
router.get("/:gameId", getGame);

/**
 * @route   POST /api/games/:gameId/turn
 * @desc    Run the next AI-driven turn
 * @access  Public
 */
router.post("/:gameId/turn", takeTurn);

/**
 * @route   DELETE /api/games/:gameId
 * @desc    Delete a game session
 * @access  Public
 */
router.delete("/:gameId", deleteGame);

// --- FIX ---
// Change this:
// module.exports = router;
//
// To this:
export default router;
