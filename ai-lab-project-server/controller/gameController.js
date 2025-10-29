// import Folly from "../gameLogic/Folly.js";
// import KBA from "../gameLogic/KBA.js";
// import Optimizer from "../gameLogic/Optimizer.js";
// import Game from "../models/Game.js";

// const GAME_SIZE = 5;
// const INITIAL_TEMP = 100;
// const COOLING_RATE = 0.99;

// // --- Helper Function: Re-hydrate classes from DB ---
// // This is critical. It creates new class instances and loads
// // the saved state from Mongo into them.
// const rehydrateClasses = (gameDoc) => {
//   const folly = new Folly(GAME_SIZE);
//   folly.grid = gameDoc.grid;
//   folly.agentPos = gameDoc.agentPos;
//   folly.exitPos = gameDoc.exitPos;
//   folly.collapsePos = gameDoc.collapsePos;
//   folly.gameOver = gameDoc.gameOver;
//   folly.gameWon = gameDoc.gameWon;

//   const kba = new KBA(GAME_SIZE);
//   kba.kb = gameDoc.kba_kb;
//   kba.visited = new Set(gameDoc.kba_visited); // Convert array back to Set
//   kba.frontier = gameDoc.kba_frontier;
//   kba.currentPos = gameDoc.agentPos;

//   const optimizer = new Optimizer(GAME_SIZE);
//   optimizer.temperature = gameDoc.optimizer_temp;
//   optimizer.coolingRate = COOLING_RATE; // Assuming this is constant

//   return { folly, kba, optimizer };
// };

// // --- API Functions ---

// /**
//  * @desc    Create a new game
//  * @route   POST /api/games
//  */
// export const createGame = async (req, res) => {
//   try {
//     // 1. Initialize new game logic
//     const folly = new Folly(GAME_SIZE);
//     const kba = new KBA(GAME_SIZE);
//     const optimizer = new Optimizer(GAME_SIZE, INITIAL_TEMP, COOLING_RATE);

//     // 2. Run the "zeroth" turn: get percepts at [0, 0]
//     const initialPercepts = folly.getPercepts(0, 0);
//     kba.addPercepts({ x: 0, y: 0 }, initialPercepts);
//     // Note: folly.moveAgent(0,0) also works, but we do it manually
//     // to ensure the game doesn't end on the first tile.
//     folly.agentPos = { x: 0, y: 0 };
//     kba.currentPos = { x: 0, y: 0 };

//     // 3. Save initial state to MongoDB
//     const newGame = new Game({
//       grid: folly.grid,
//       agentPos: folly.agentPos,
//       exitPos: folly.exitPos,
//       collapsePos: folly.collapsePos,
//       kba_kb: kba.kb,
//       kba_visited: Array.from(kba.visited), // Convert Set to Array
//       kba_frontier: kba.frontier,
//       optimizer_temp: optimizer.temperature,
//       moveCount: 0,
//     });

//     await newGame.save();

//     // 201 Created
//     res.status(201).json(newGame);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };

// /**
//  * @desc    Get a game's state
//  * @route   GET /api/games/:gameId
//  */
// export const getGame = async (req, res) => {
//   try {
//     const game = await Game.findById(req.params.gameId);
//     if (!game) {
//       return res.status(404).json({ msg: "Game not found" });
//     }
//     res.json(game);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };

// /**
//  * @desc    Run the next AI-driven turn
//  * @route   POST /api/games/:gameId/turn
//  */
// export const takeTurn = async (req, res) => {
//   try {
//     let game = await Game.findById(req.params.gameId);
//     if (!game) {
//       return res.status(404).json({ msg: "Game not found" });
//     }
//     if (game.gameOver) {
//       return res.status(400).json({ msg: "Game is already over", game });
//     }

//     // 1. Re-hydrate classes with state from DB
//     const { folly, kba, optimizer } = rehydrateClasses(game);

//     // --- 2. Run One Game Loop Turn ---
//     const nextMove = kba.findNextMove();
//     if (!nextMove) {
//       folly.gameOver = true;
//       game.gameOver = true;
//       // Also pass back the final game state
//       const updatedGame = await game.save();
//       return res
//         .status(400)
//         .json({ msg: "KBA is stuck! Game Over.", game: updatedGame });
//     }

//     const result = folly.moveAgent(nextMove.x, nextMove.y);

//     if (!folly.gameOver) {
//       kba.addPercepts(nextMove, result.percepts);

//       const currentExit = folly.exitPos;
//       const newExit = optimizer.runJolt(currentExit);
//       optimizer.coolDown();
//       if (newExit.x !== currentExit.x || newExit.y !== currentExit.y) {
//         folly.updateExit(newExit);
//       }
//     }
//     // --- End Game Loop Turn ---

//     // 3. Persist the *new* state back to the DB document
//     game.agentPos = folly.agentPos;
//     game.exitPos = folly.exitPos;
//     game.gameOver = folly.gameOver;
//     game.gameWon = folly.gameWon;
//     game.kba_kb = kba.kb;
//     game.kba_visited = Array.from(kba.visited);
//     game.kba_frontier = kba.frontier;
//     game.optimizer_temp = optimizer.temperature;
//     game.lastMoveAt = Date.now();
//     game.moveCount += 1;

//     const updatedGame = await game.save();

//     // 4. Return the new game state
//     res.json(updatedGame);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };

// /**
//  * @desc    Delete a game
//  * @route   DELETE /api/games/:gameId
//  */
// export const deleteGame = async (req, res) => {
//   try {
//     // Use findByIdAndDelete for a single atomic operation
//     const game = await Game.findByIdAndDelete(req.params.gameId);

//     if (!game) {
//       return res.status(4404).json({ msg: "Game not found" });
//     }

//     res.json({ msg: "Game removed" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };
import Folly from "../gameLogic/Folly.js";
import KBA from "../gameLogic/KBA.js";
import Optimizer from "../gameLogic/Optimizer.js";
import Game from "../models/Game.js";

// Game constants updated
const GAME_SIZE = 8;
const INITIAL_TEMP = 100;
const COOLING_RATE = 0.99;

// --- Helper Function: Re-hydrate classes from DB ---
// This creates new class instances and loads the saved state.
const rehydrateClasses = (gameDoc) => {
  const folly = new Folly(GAME_SIZE);
  folly.grid = gameDoc.grid;
  folly.agentPos = gameDoc.agentPos;
  folly.exitPos = gameDoc.exitPos;
  folly.collapsePos = gameDoc.collapsePos;
  folly.gameOver = gameDoc.gameOver;
  folly.gameWon = gameDoc.gameWon;

  const kba = new KBA(GAME_SIZE);
  kba.kb = gameDoc.kba_kb;
  kba.visited = new Set(gameDoc.kba_visited); // Convert array back to Set
  kba.frontier = gameDoc.kba_frontier;
  kba.currentPos = gameDoc.agentPos;

  const optimizer = new Optimizer(GAME_SIZE); // Pass GAME_SIZE
  optimizer.temperature = gameDoc.optimizer_temp;
  optimizer.coolingRate = COOLING_RATE; // Assuming this is constant

  return { folly, kba, optimizer };
};

// --- API Functions ---

/**
 * @desc    Create a new game
 * @route   POST /api/games
 */
export const createGame = async (req, res) => {
  try {
    // 1. Initialize new game logic (using 8x8 defaults)
    const folly = new Folly(GAME_SIZE);
    const kba = new KBA(GAME_SIZE);
    const optimizer = new Optimizer(GAME_SIZE, INITIAL_TEMP, COOLING_RATE);

    // 2. Run the "zeroth" turn: get percepts at [0, 0]
    const initialPercepts = folly.getPercepts(0, 0);
    kba.addPercepts({ x: 0, y: 0 }, initialPercepts);
    folly.agentPos = { x: 0, y: 0 };
    kba.currentPos = { x: 0, y: 0 };

    // 3. Save initial state to MongoDB
    const newGame = new Game({
      grid: folly.grid,
      agentPos: folly.agentPos,
      exitPos: folly.exitPos,
      collapsePos: folly.collapsePos,
      kba_kb: kba.kb,
      kba_visited: Array.from(kba.visited), // Convert Set to Array
      kba_frontier: kba.frontier,
      optimizer_temp: optimizer.temperature,
      moveCount: 0,
    });

    await newGame.save();

    // 201 Created
    res.status(201).json(newGame);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get a game's state
 * @route   GET /api/games/:gameId
 */
export const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ msg: "Game not found" });
    }
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Run the next AI-driven turn
 * @route   POST /api/games/:gameId/turn
 */
export const takeTurn = async (req, res) => {
  try {
    let game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ msg: "Game not found" });
    }
    if (game.gameOver) {
      return res.status(400).json({ msg: "Game is already over", game });
    }

    // 1. Re-hydrate classes with state from DB
    const { folly, kba, optimizer } = rehydrateClasses(game);

    // --- 2. Run One Game Loop Turn ---
    const nextMove = kba.findNextMove();
    if (!nextMove) {
      folly.gameOver = true;
      game.gameOver = true;
      const updatedGame = await game.save();
      return res
        .status(400)
        .json({ msg: "KBA is stuck! Game Over.", game: updatedGame });
    }

    const result = folly.moveAgent(nextMove.x, nextMove.y);

    if (!folly.gameOver) {
      // KBA learns from the move
      kba.addPercepts(nextMove, result.percepts);

      const currentExit = folly.exitPos;

      // --- IMPORTANT CHANGE ---
      // Pass the complete game state (folly) and agent knowledge (kba)
      // to the optimizer so it can make an intelligent decision.
      const newExit = optimizer.runJolt(currentExit, folly, kba);
      // --- END OF CHANGE ---

      optimizer.coolDown();
      if (newExit.x !== currentExit.x || newExit.y !== currentExit.y) {
        folly.updateExit(newExit);
      }
    }
    // --- End Game Loop Turn ---

    // 3. Persist the *new* state back to the DB document
    game.agentPos = folly.agentPos;
    game.exitPos = folly.exitPos;
    game.gameOver = folly.gameOver;
    game.gameWon = folly.gameWon;
    game.kba_kb = kba.kb;
    game.kba_visited = Array.from(kba.visited);
    game.kba_frontier = kba.frontier;
    game.optimizer_temp = optimizer.temperature;
    game.lastMoveAt = Date.now();
    game.moveCount += 1;

    const updatedGame = await game.save();

    // 4. Return the new game state
    res.json(updatedGame);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Delete a game
 * @route   DELETE /api/games/:gameId
 */
export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.gameId);

    if (!game) {
      return res.status(404).json({ msg: "Game not found" });
    }

    res.json({ msg: "Game removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
