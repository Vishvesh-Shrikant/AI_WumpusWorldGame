import React from "react";

// Grid size is 8x8
const GRID_SIZE = 8;

// Helper function to get the display and class for a cell
function getCellInfo(x, y, kba_kb, agentPos, exitPos, visited) {
  const baseClass =
    "w-full h-full grid place-items-center font-mono text-xs font-bold border border-gray-700 box-border";

  // Priority 1: Agent
  if (agentPos.x === x && agentPos.y === y) {
    return {
      content: "🤖",
      className: `${baseClass} bg-indigo-500 text-white z-10 text-lg`,
    }; // Emoji for agent
  }

  // Priority 2: Exit (Shimmer)
  if (exitPos.x === x && exitPos.y === y) {
    return {
      content: "✨",
      className: `${baseClass} bg-yellow-500/20 text-yellow-300 animate-pulse text-lg`,
    };
  }

  const key = `${x},${y}`;
  const node = kba_kb[y][x];

  // Priority 3: Visited (and not agent)
  if (visited.includes(key)) {
    return {
      content: "[OK]",
      className: `${baseClass} bg-gray-700 text-gray-400`,
    };
  }

  // Priority 4: Inferred Safe (on frontier)
  if (node.safe === true || (node.pitProb < 0 && node.collapseProb < 0)) {
    return {
      content: "[S]",
      className: `${baseClass} bg-green-500/10 text-green-300`,
    };
  }

  // Priority 5: Inferred Risky
  if (node.pitProb > 0 || node.collapseProb > 0) {
    return {
      content: "[?]",
      className: `${baseClass} bg-red-500/10 text-red-300`,
    };
  }

  // Default: Unknown
  return {
    content: "",
    className: `${baseClass} bg-gray-800/60 text-gray-600`,
  };
}

export default function Grid({ kba_kb, agentPos, exitPos, visited }) {
  // Create an array [0, 1, ..., 7] for mapping
  const cells = [...Array(GRID_SIZE).keys()];

  return (
    <div className='grid grid-cols-8 grid-rows-8 border-2 border-gray-700 w-full aspect-square max-w-full max-h-full'>
      {cells.map((y) => (
        <React.Fragment key={y}>
          {cells.map((x) => {
            // Check if kba_kb[y] exists before accessing kba_kb[y][x]
            if (!kba_kb || !kba_kb[y] || kba_kb[y][x] === undefined) {
              return (
                <div
                  key={`${x}-${y}`}
                  className='w-full h-full border border-gray-700 bg-gray-800/60'
                />
              );
            }
            const { content, className } = getCellInfo(
              x,
              y,
              kba_kb,
              agentPos,
              exitPos,
              visited
            );
            return (
              <div key={`${x}-${y}`} className={className}>
                {content}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
