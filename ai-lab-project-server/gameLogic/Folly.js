// // Represents the game world
// class Folly {
//   constructor(size = 5, pitProb = 0.2) {
//     this.size = size;
//     this.pitProb = pitProb;
//     this.grid = this._initializeGrid();
//     this.agentPos = { x: 0, y: 0 };
//     this.exitPos = { x: size - 1, y: size - 1 }; // Initial exit
//     this.collapsePos = {};
//     this.gameOver = false;
//     this.gameWon = false;

//     this._placeEntities();
//   }

//   _initializeGrid() {
//     // Create an empty grid
//     return Array(this.size)
//       .fill(null)
//       .map(() =>
//         Array(this.size)
//           .fill(null)
//           .map(() => ({
//             pit: false,
//           }))
//       );
//   }

//   _placeEntities() {
//     // Place Pits (Hazards)
//     for (let y = 0; y < this.size; y++) {
//       for (let x = 0; x < this.size; x++) {
//         if (x === 0 && y === 0) continue; // No hazard at start
//         if (Math.random() < this.pitProb) {
//           this.grid[y][x].pit = true;
//         }
//       }
//     }

//     // Place Collapse Point (Wumpus)
//     // Ensure it's not at the start or in a pit
//     do {
//       this.collapsePos = {
//         x: Math.floor(Math.random() * this.size),
//         y: Math.floor(Math.random() * this.size),
//       };
//     } while (
//       (this.collapsePos.x === 0 && this.collapsePos.y === 0) ||
//       this.grid[this.collapsePos.y][this.collapsePos.x].pit
//     );
//   }

//   _isValid(x, y) {
//     return x >= 0 && x < this.size && y >= 0 && y < this.size;
//   }

//   getPercepts(x, y) {
//     const percepts = {
//       draft: false,
//       creak: false,
//       shimmer: false,
//     };

//     // 1. Check for Shimmer (on the exit)
//     if (x === this.exitPos.x && y === this.exitPos.y) {
//       percepts.shimmer = true;
//     }

//     // Check adjacent tiles for Draft (Pit) and Creak (Collapse)
//     const neighbors = [
//       [x - 1, y],
//       [x + 1, y],
//       [x, y - 1],
//       [x, y + 1],
//     ];

//     for (const [nx, ny] of neighbors) {
//       if (this._isValid(nx, ny)) {
//         if (this.grid[ny][nx].pit) {
//           percepts.draft = true;
//         }
//         if (nx === this.collapsePos.x && ny === this.collapsePos.y) {
//           percepts.creak = true;
//         }
//       }
//     }
//     return percepts;
//   }

//   // Called by the KBA to move
//   moveAgent(x, y) {
//     if (this.gameOver) return { status: "Game Over", percepts: {} };

//     if (!this._isValid(x, y)) {
//       return {
//         status: "Bumped wall",
//         percepts: this.getPercepts(this.agentPos.x, this.agentPos.y),
//       };
//     }

//     this.agentPos = { x, y };

//     // Check for game over or win
//     if (this.grid[y][x].pit) {
//       this.gameOver = true;
//       return { status: "LOSE: Fell into a Hazard!", percepts: {} };
//     }
//     if (x === this.collapsePos.x && y === this.collapsePos.y) {
//       this.gameOver = true;
//       return { status: "LOSE: Found the Collapse Point!", percepts: {} };
//     }
//     if (x === this.exitPos.x && y === this.exitPos.y) {
//       this.gameOver = true;
//       this.gameWon = true;
//       return {
//         status: "WIN: Found the Optimum Exit!",
//         percepts: { shimmer: true },
//       };
//     }

//     return { status: "Moved", percepts: this.getPercepts(x, y) };
//   }

//   // Called by the Optimizer AI
//   updateExit(newExitPos) {
//     this.exitPos = newExitPos;
//     console.log(
//       `(Structural Jolt) Exit moved to [${newExitPos.x}, ${newExitPos.y}]`
//     );
//   }
// }

// // --- FIX ---
// // Add the ES6 export statement
// export default Folly;
// Represents the game world
class Folly {
  // --- CHANGE: Default size is 8, pitProb is 0.16 (20% less than 0.2) ---
  constructor(size = 8, pitProb = 0.16) {
    this.size = size;
    this.pitProb = pitProb;
    this.grid = this._initializeGrid();
    this.agentPos = { x: 0, y: 0 };
    this.exitPos = { x: size - 1, y: size - 1 }; // Initial exit
    this.collapsePos = {};
    this.gameOver = false;
    this.gameWon = false;

    this._placeEntities();
  }

  _initializeGrid() {
    // Create an empty grid
    return Array(this.size)
      .fill(null)
      .map(() =>
        Array(this.size)
          .fill(null)
          .map(() => ({
            pit: false,
          }))
      );
  }

  _placeEntities() {
    // Place Pits (Hazards)
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (x === 0 && y === 0) continue; // No hazard at start
        if (Math.random() < this.pitProb) {
          this.grid[y][x].pit = true;
        }
      }
    }

    // Place Collapse Point (Wumpus)
    // Ensure it's not at the start or in a pit
    do {
      this.collapsePos = {
        x: Math.floor(Math.random() * this.size),
        y: Math.floor(Math.random() * this.size),
      };
    } while (
      (this.collapsePos.x === 0 && this.collapsePos.y === 0) ||
      (this.grid[this.collapsePos.y] && // Add safety check
        this.grid[this.collapsePos.y][this.collapsePos.x].pit)
    );
  }

  _isValid(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  getPercepts(x, y) {
    const percepts = {
      draft: false,
      creak: false,
      shimmer: false,
    };

    // 1. Check for Shimmer (on the exit)
    if (x === this.exitPos.x && y === this.exitPos.y) {
      percepts.shimmer = true;
    }

    // Check adjacent tiles for Draft (Pit) and Creak (Collapse)
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (this._isValid(nx, ny)) {
        if (this.grid[ny][nx].pit) {
          percepts.draft = true;
        }
        if (nx === this.collapsePos.x && ny === this.collapsePos.y) {
          percepts.creak = true;
        }
      }
    }
    return percepts;
  }

  // Called by the KBA to move
  moveAgent(x, y) {
    if (this.gameOver) return { status: "Game Over", percepts: {} };

    if (!this._isValid(x, y)) {
      return {
        status: "Bumped wall",
        percepts: this.getPercepts(this.agentPos.x, this.agentPos.y),
      };
    }

    this.agentPos = { x, y };

    // Check for game over or win
    if (this.grid[y][x].pit) {
      this.gameOver = true;
      return { status: "LOSE: Fell into a Hazard!", percepts: {} };
    }
    if (x === this.collapsePos.x && y === this.collapsePos.y) {
      this.gameOver = true;
      return { status: "LOSE: Found the Collapse Point!", percepts: {} };
    }
    if (x === this.exitPos.x && y === this.exitPos.y) {
      this.gameOver = true;
      this.gameWon = true;
      return {
        status: "WIN: Found the Optimum Exit!",
        percepts: { shimmer: true },
      };
    }

    return { status: "Moved", percepts: this.getPercepts(x, y) };
  }

  // Called by the Optimizer AI
  updateExit(newExitPos) {
    this.exitPos = newExitPos;
    console.log(
      `(Structural Jolt) Exit moved to [${newExitPos.x}, ${newExitPos.y}]`
    );
  }
}

export default Folly;
