// // Runs the Simulated Annealing to move the exit
// class Optimizer {
//   constructor(gridSize, initialTemp = 100, coolingRate = 0.99) {
//     this.gridSize = gridSize;
//     this.temperature = initialTemp;
//     this.coolingRate = coolingRate;
//   }

//   // The "Objective Function" to maximize
//   // Here, we define the "best" exit as one far from the center (for example)
//   _objectiveFunction(x, y) {
//     const centerX = (this.gridSize - 1) / 2;
//     const centerY = (this.gridSize - 1) / 2;
//     // Use squared Euclidean distance to avoid sqrt
//     return Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
//   }

//   _getNeighbor(pos) {
//     const neighbors = [
//       [pos.x - 1, pos.y],
//       [pos.x + 1, pos.y],
//       [pos.x, pos.y - 1],
//       [pos.x, pos.y + 1],
//     ].filter(
//       ([nx, ny]) =>
//         nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize
//     );

//     // Handle edge case where a neighbor might not exist (though unlikely in a >1x1 grid)
//     if (neighbors.length === 0) return [pos.x, pos.y];

//     return neighbors[Math.floor(Math.random() * neighbors.length)];
//   }

//   // Runs one step of the SA
//   runJolt(currentExit) {
//     if (this.temperature <= 0.1) {
//       return currentExit; // Frozen
//     }

//     // 1. Get current "energy" (score)
//     const currentEnergy = this._objectiveFunction(currentExit.x, currentExit.y);

//     // 2. Get a random neighbor
//     const [nx, ny] = this._getNeighbor(currentExit);
//     if (nx === undefined || ny === undefined) {
//       // Safety check
//       return currentExit;
//     }
//     const newEnergy = this._objectiveFunction(nx, ny);

//     // 3. Decide to move
//     if (newEnergy > currentEnergy) {
//       // Always accept a better move
//       return { x: nx, y: ny };
//     } else {
//       // Accept a "worse" move based on probability
//       const acceptanceProb = Math.exp(
//         (newEnergy - currentEnergy) / this.temperature
//       );
//       if (Math.random() < acceptanceProb) {
//         return { x: nx, y: ny };
//       } else {
//         // Stay put
//         return currentExit;
//       }
//     }
//   }

//   // Call this after the jolt
//   coolDown() {
//     this.temperature *= this.coolingRate;
//   }
// }

// // --- FIX ---
// // Add the ES6 export statement
// export default Optimizer;
// Runs the Simulated Annealing to move the exit
class Optimizer {
  constructor(gridSize, initialTemp = 100, coolingRate = 0.99) {
    this.gridSize = gridSize;
    this.temperature = initialTemp;
    this.coolingRate = coolingRate;
  }

  // --- CHANGE: The Objective Function is now aware of the game state ---
  _objectiveFunction(x, y, folly, kba) {
    // 1. Check for deadly locations (from Folly's ground truth)
    // If it's a hazard, it's the worst possible score.
    if (folly.grid[y][x].pit) {
      return -10000;
    }
    if (x === folly.collapsePos.x && y === folly.collapsePos.y) {
      return -10000;
    }

    // 2. Base score (the original function: prefers corners)
    const centerX = (this.gridSize - 1) / 2;
    const centerY = (this.gridSize - 1) / 2;
    let score = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);

    // 3. Apply penalties/bonuses based on KBA's *knowledge*
    const kbaNode = kba.kb[y][x];

    // If KBA knows it's risky, apply a penalty
    // (We check > 0 because < 0 means "confirmed safe")
    if (kbaNode.pitProb > 0) {
      score -= 50; // Moderate penalty
    }
    if (kbaNode.collapseProb > 0) {
      score -= 50; // Moderate penalty
    }

    // If KBA knows it's 100% safe, add a bonus
    // This makes the Exit prefer areas the KBA has already cleared.
    if (
      kbaNode.safe === true ||
      (kbaNode.pitProb < 0 && kbaNode.collapseProb < 0)
    ) {
      score += 25; // Small bonus
    }

    return score;
  }

  _getNeighbor(pos) {
    const neighbors = [
      [pos.x - 1, pos.y],
      [pos.x + 1, pos.y],
      [pos.x, pos.y - 1],
      [pos.x, pos.y + 1],
    ].filter(
      ([nx, ny]) =>
        nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize
    );

    if (neighbors.length === 0) return [pos.x, pos.y];
    return neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  // --- CHANGE: runJolt now receives folly and kba ---
  runJolt(currentExit, folly, kba) {
    if (this.temperature <= 0.1) {
      return currentExit; // Frozen
    }

    // 1. Get current "energy" (score)
    const currentEnergy = this._objectiveFunction(
      currentExit.x,
      currentExit.y,
      folly,
      kba
    );

    // 2. Get a random neighbor
    const [nx, ny] = this._getNeighbor(currentExit);
    if (nx === undefined || ny === undefined) {
      return currentExit;
    }
    const newEnergy = this._objectiveFunction(nx, ny, folly, kba);

    // 3. Decide to move (SA logic is unchanged)
    if (newEnergy > currentEnergy) {
      // Always accept a better move
      return { x: nx, y: ny };
    } else {
      // Accept a "worse" move based on probability
      const acceptanceProb = Math.exp(
        (newEnergy - currentEnergy) / this.temperature
      );
      if (Math.random() < acceptanceProb) {
        return { x: nx, y: ny };
      } else {
        // Stay put
        return currentExit;
      }
    }
  }

  // Call this after the jolt
  coolDown() {
    this.temperature *= this.coolingRate;
  }
}

export default Optimizer;
