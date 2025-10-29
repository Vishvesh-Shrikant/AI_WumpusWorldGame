// // The Player's AI
// class KBA {
//   constructor(size = 5) {
//     this.size = size;
//     this.kb = this._initializeKB(); // The Knowledge Base
//     this.visited = new Set();
//     this.frontier = []; // A stack of safe, unvisited tiles to explore
//     this.currentPos = { x: 0, y: 0 };

//     // Start by knowing [0,0] is safe
//     this.kb[0][0].safe = true;
//     this.frontier.push({ x: 0, y: 0 });
//   }

//   _initializeKB() {
//     // State: 'Unknown', 'Safe', 'Pit', 'Collapse'
//     return Array(this.size)
//       .fill(null)
//       .map(() =>
//         Array(this.size)
//           .fill(null)
//           .map(() => ({
//             safe: "Unknown",
//             pitProb: 0, // Counter for pit probability
//             collapseProb: 0, // Counter for collapse probability
//           }))
//       );
//   }

//   _isValid(x, y) {
//     return x >= 0 && x < this.size && y >= 0 && y < this.size;
//   }

//   _getNeighbors(x, y) {
//     return [
//       [x - 1, y],
//       [x + 1, y],
//       [x, y - 1],
//       [x, y + 1],
//     ].filter(([nx, ny]) => this._isValid(nx, ny));
//   }

//   // This is the core logical inference
//   addPercepts(pos, percepts) {
//     const { x, y } = pos;
//     const visitedKey = `${x},${y}`;

//     // 1. Mark current tile as visited and safe
//     this.visited.add(visitedKey);
//     this.kb[y][x].safe = true;
//     this.kb[y][x].pitProb = -100; // Confirmed not a pit
//     this.kb[y][x].collapseProb = -100; // Confirmed not collapse

//     const neighbors = this._getNeighbors(x, y);

//     // 2. Inference from percepts
//     // If NO DRAFT, all unknown neighbors are safe from pits
//     if (!percepts.draft) {
//       for (const [nx, ny] of neighbors) {
//         if (this.kb[ny][nx].safe === "Unknown") {
//           this.kb[ny][nx].safe = true;
//           this.kb[ny][nx].pitProb = -100; // Confirmed safe from pits
//         }
//       }
//     } else {
//       // If DRAFT, all unknown neighbors get +1 pit probability
//       for (const [nx, ny] of neighbors) {
//         if (this.kb[ny][nx].safe === "Unknown") {
//           this.kb[ny][nx].pitProb += 1;
//         }
//       }
//     }

//     // If NO CREAK, all unknown neighbors are safe from collapse
//     if (!percepts.creak) {
//       for (const [nx, ny] of neighbors) {
//         if (this.kb[ny][nx].safe === "Unknown") {
//           this.kb[ny][nx].collapseProb = -100; // Confirmed safe from collapse
//         }
//       }
//     } else {
//       // If CREAK, all unknown neighbors get +1 collapse probability
//       for (const [nx, ny] of neighbors) {
//         if (this.kb[ny][nx].safe === "Unknown") {
//           this.kb[ny][nx].collapseProb += 1;
//         }
//       }
//     }

//     // 3. Update frontier
//     // Add all newly-discovered *guaranteed safe* neighbors to the frontier
//     for (const [nx, ny] of neighbors) {
//       const neighborKey = `${nx},${ny}`;
//       const node = this.kb[ny][nx];

//       // A tile is *guaranteed safe* if its safe status is set to true
//       // OR if we've inferred it's safe from both pits and collapses
//       if (
//         (node.safe === true || (node.pitProb < 0 && node.collapseProb < 0)) &&
//         !this.visited.has(neighborKey)
//       ) {
//         // Add to frontier if not already there
//         if (!this.frontier.some((f) => f.x === nx && f.y === ny)) {
//           this.frontier.push({ x: nx, y: ny });
//         }
//       }
//     }
//   }

//   // The main "AI" decision function
//   findNextMove() {
//     // 1. Pop from the frontier (DFS-style)
//     let nextMove = this.frontier.pop();

//     // 2. If frontier is empty, we are stuck.
//     // We must make a probabilistic move (pick the tile with lowest pit/collapse prob)
//     if (!nextMove) {
//       console.log("KBA: Frontier is empty. Making a risky move.");
//       let minRisk = 1000;
//       let bestRiskyMove = null;

//       for (let y = 0; y < this.size; y++) {
//         for (let x = 0; x < this.size; x++) {
//           const key = `${x},${y}`;
//           const node = this.kb[y][x];
//           if (!this.visited.has(key) && node.safe === "Unknown") {
//             const risk =
//               Math.max(0, node.pitProb) + Math.max(0, node.collapseProb);
//             if (risk < minRisk) {
//               minRisk = risk;
//               bestRiskyMove = { x, y };
//             }
//           }
//         }
//       }
//       if (!bestRiskyMove) return null; // Truly no moves left
//       nextMove = bestRiskyMove;
//     }

//     this.currentPos = nextMove;
//     return this.currentPos;
//   }

//   // For debugging/UI
//   printKB() {
//     console.log("--- KBA Knowledge Base ---");
//     for (let y = 0; y < this.size; y++) {
//       let row = "";
//       for (let x = 0; x < this.size; x++) {
//         const key = `${x},${y}`;
//         const node = this.kb[y][x];

//         if (this.currentPos.x === x && this.currentPos.y === y) {
//           row += "[A] ";
//         } else if (this.visited.has(key)) {
//           row += "[OK] ";
//         } else if (
//           node.safe === true ||
//           (node.pitProb < 0 && node.collapseProb < 0)
//         ) {
//           row += "[S]  "; // Safe, unvisited
//         } else if (node.pitProb > 0 || node.collapseProb > 0) {
//           row += "[?]  "; // Risky
//         } else {
//           row += "[ ]  "; // Unknown
//         }
//       }
//       console.log(row);
//     }
//     console.log("--------------------------");
//   }
// }

// // --- FIX ---
// // Add the ES6 export statement
// export default KBA;
// The Player's AI
class KBA {
  // --- CHANGE: Default size is 8 ---
  constructor(size = 8) {
    this.size = size;
    this.kb = this._initializeKB(); // The Knowledge Base
    this.visited = new Set();
    this.frontier = []; // A stack of safe, unvisited tiles to explore
    this.currentPos = { x: 0, y: 0 };

    // Start by knowing [0,0] is safe
    this.kb[0][0].safe = true;
    this.frontier.push({ x: 0, y: 0 });
  }

  _initializeKB() {
    // State: 'Unknown', 'Safe', 'Pit', 'Collapse'
    return Array(this.size)
      .fill(null)
      .map(() =>
        Array(this.size)
          .fill(null)
          .map(() => ({
            safe: "Unknown",
            pitProb: 0, // Counter for pit probability
            collapseProb: 0, // Counter for collapse probability
          }))
      );
  }

  _isValid(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  _getNeighbors(x, y) {
    return [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ].filter(([nx, ny]) => this._isValid(nx, ny));
  }

  // This is the core logical inference
  addPercepts(pos, percepts) {
    const { x, y } = pos;
    const visitedKey = `${x},${y}`;

    // 1. Mark current tile as visited and safe
    this.visited.add(visitedKey);
    this.kb[y][x].safe = true;
    this.kb[y][x].pitProb = -100; // Confirmed not a pit
    this.kb[y][x].collapseProb = -100; // Confirmed not collapse

    const neighbors = this._getNeighbors(x, y);

    // 2. Inference from percepts
    // If NO DRAFT, all unknown neighbors are safe from pits
    if (!percepts.draft) {
      for (const [nx, ny] of neighbors) {
        if (this.kb[ny][nx].safe === "Unknown") {
          this.kb[ny][nx].safe = true;
          this.kb[ny][nx].pitProb = -100; // Confirmed safe from pits
        }
      }
    } else {
      // If DRAFT, all unknown neighbors get +1 pit probability
      for (const [nx, ny] of neighbors) {
        if (this.kb[ny][nx].safe === "Unknown") {
          this.kb[ny][nx].pitProb += 1;
        }
      }
    }

    // If NO CREAK, all unknown neighbors are safe from collapse
    if (!percepts.creak) {
      for (const [nx, ny] of neighbors) {
        if (this.kb[ny][nx].safe === "Unknown") {
          this.kb[ny][nx].collapseProb = -100; // Confirmed safe from collapse
        }
      }
    } else {
      // If CREAK, all unknown neighbors get +1 collapse probability
      for (const [nx, ny] of neighbors) {
        if (this.kb[ny][nx].safe === "Unknown") {
          this.kb[ny][nx].collapseProb += 1;
        }
      }
    }

    // 3. Update frontier
    // Add all newly-discovered *guaranteed safe* neighbors to the frontier
    for (const [nx, ny] of neighbors) {
      const neighborKey = `${nx},${ny}`;
      const node = this.kb[ny][nx];

      // A tile is *guaranteed safe* if its safe status is set to true
      // OR if we've inferred it's safe from both pits and collapses
      if (
        (node.safe === true || (node.pitProb < 0 && node.collapseProb < 0)) &&
        !this.visited.has(neighborKey)
      ) {
        // Add to frontier if not already there
        if (!this.frontier.some((f) => f.x === nx && f.y === ny)) {
          this.frontier.push({ x: nx, y: ny });
        }
      }
    }
  }

  // The main "AI" decision function
  findNextMove() {
    // 1. Pop from the frontier (DFS-style)
    let nextMove = this.frontier.pop();

    // 2. If frontier is empty, we are stuck.
    // We must make a probabilistic move (pick the tile with lowest pit/collapse prob)
    if (!nextMove) {
      console.log("KBA: Frontier is empty. Making a risky move.");
      let minRisk = 1000;
      let bestRiskyMove = null;

      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          const key = `${x},${y}`;
          const node = this.kb[y][x];
          if (!this.visited.has(key) && node.safe === "Unknown") {
            const risk =
              Math.max(0, node.pitProb) + Math.max(0, node.collapseProb);
            if (risk < minRisk) {
              minRisk = risk;
              bestRiskyMove = { x, y };
            }
          }
        }
      }
      if (!bestRiskyMove) return null; // Truly no moves left
      nextMove = bestRiskyMove;
    }

    this.currentPos = nextMove;
    return this.currentPos;
  }

  // For debugging/UI
  printKB() {
    console.log("--- KBA Knowledge Base ---");
    for (let y = 0; y < this.size; y++) {
      let row = "";
      for (let x = 0; x < this.size; x++) {
        const key = `${x},${y}`;
        const node = this.kb[y][x];

        if (this.currentPos.x === x && this.currentPos.y === y) {
          row += "[A] ";
        } else if (this.visited.has(key)) {
          row += "[OK] ";
        } else if (
          node.safe === true ||
          (node.pitProb < 0 && node.collapseProb < 0)
        ) {
          row += "[S]  "; // Safe, unvisited
        } else if (node.pitProb > 0 || node.collapseProb > 0) {
          row += "[?]  "; // Risky
        } else {
          row += "[ ]  "; // Unknown
        }
      }
      console.log(row);
    }
    console.log("--------------------------");
  }
}

export default KBA;
