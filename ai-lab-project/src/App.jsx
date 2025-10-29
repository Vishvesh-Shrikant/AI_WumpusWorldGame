import { useState, useCallback } from "react";
import Grid from "./components/Grid";
import Legend from "./components/Legend";

// Set your backend API URL here
const API_URL =
  `${import.meta.env.API_URL}/api/games` | "http://localhost:5000/api/games";

export default function App() {
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // New message state for better alerts (handles win/loss colors)
  const [message, setMessage] = useState({ text: "", type: "info" }); // type: 'info', 'success', 'error'

  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "info" }); // Clear previous messages
    setGame(null); // Clear old game state immediately
    try {
      const res = await fetch(API_URL, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Failed to start game");
      }
      setGame(data);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
    setIsLoading(false);
  }, []);

  const handleNextTurn = useCallback(async () => {
    if (!game || game.gameOver) return;

    setIsLoading(true);
    setMessage({ text: "", type: "info" }); // Clear previous messages
    try {
      const res = await fetch(`${API_URL}/${game._id}/turn`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorData = {
          message: data.msg || "Failed to take turn",
          game: data.game,
        };
        throw errorData;
      }

      setGame(data);

      if (data.gameOver) {
        if (data.gameWon) {
          setMessage({ text: "Game Won! The KBA escaped.", type: "success" });
        } else {
          setMessage({ text: "Game Over! The KBA failed.", type: "error" });
        }
      }
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
      if (err.game) {
        setGame(err.game); // Update to final game state on loss
      }
    }
    setIsLoading(false);
  }, [game]);

  const gameInProgress = game && !game.gameOver;

  const getMessageColor = () => {
    if (message.type === "success")
      return "bg-green-500/10 text-green-300 border-green-500/30";
    if (message.type === "error")
      return "bg-red-500/10 text-red-300 border-red-500/30";
    return "bg-gray-700 text-gray-300 border-gray-600";
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-900 px-4 py-4 sm:py-5 font-sans text-gray-200'>
      <div className='container w-full max-w-3xl bg-gray-800 shadow-2xl rounded-2xl p-4 md:p-5 max-h-[95vh] flex flex-col'>
        {/* --- Header --- */}
        <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-700'>
          <h1 className='text-2xl lg:text-3xl font-extrabold text-white mb-4 sm:mb-0'>
            The Architect's Folly
          </h1>
          {game && (
            <button
              onClick={startNewGame}
              disabled={isLoading}
              className='px-4 py-2 rounded-lg font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200 disabled:bg-gray-600'
            >
              New Game
            </button>
          )}
        </div>

        {/* --- Message Area (for Errors and Wins) --- */}
        {message.text && (
          <div
            className={`p-3 rounded-lg my-4 border text-sm font-medium ${getMessageColor()}`}
          >
            {message.text}
          </div>
        )}

        {/* --- No Game Started View --- */}
        {!game && (
          <div className='text-center py-16'>
            <h2 className='text-2xl font-semibold text-gray-400 mb-6'>
              Welcome, KBA.
            </h2>
            <button
              onClick={startNewGame}
              disabled={isLoading}
              className='text-lg font-bold px-8 py-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none'
            >
              {isLoading ? "Loading..." : "Start New Game"}
            </button>
          </div>
        )}

        {/* --- Main Game View --- */}
        {game && (
          <div className='flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0'>
            {/* --- Center Column (Grid) - now 3/5 of width --- */}
            <div className='lg:col-span-3 flex justify-center items-center min-h-0'>
              <Grid
                kba_kb={game.kba_kb}
                agentPos={game.agentPos}
                exitPos={game.exitPos}
                visited={game.kba_visited}
              />
            </div>

            {/* --- Right Column (Info & Actions) - now 2/5 of width --- */}
            <div className='lg:col-span-2 flex flex-col gap-4'>
              {/* --- Action Button (Moved Here) --- */}
              <button
                onClick={handleNextTurn}
                disabled={isLoading || !gameInProgress}
                className='w-full text-sm font-bold px-6 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none'
              >
                {isLoading ? "Thinking..." : "Next AI Move"}
              </button>

              {/* --- Stats Panel --- */}
              <div className='text-left bg-gray-900/50 p-3 rounded-xl border border-gray-700'>
                <h3 className='text-base font-bold text-white mb-2'>
                  Game Status
                </h3>
                <div className='space-y-1'>
                  <p className='text-xs'>
                    Move:{" "}
                    <strong className='font-bold text-gray-100 ml-2'>
                      {game.moveCount}
                    </strong>
                  </p>
                  <p className='text-xs'>
                    Optimizer Temp:{" "}
                    <strong className='font-bold text-gray-100 ml-2'>
                      {game.optimizer_temp.toFixed(2)}
                    </strong>
                  </p>
                </div>

                {game.gameOver && (
                  <div
                    className={`text-base font-bold mt-3 p-2 rounded-lg text-center ${
                      game.gameWon
                        ? "bg-green-500/10 text-green-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {game.gameWon ? "🏆 VICTORY!" : "☠️ GAME OVER"}
                  </div>
                )}
              </div>

              {/* --- Legend Panel --- */}
              <Legend />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
