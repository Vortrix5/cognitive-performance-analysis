import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

function generateSequence(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export default function MemoryGame({ value, onComplete }) {
  const rounds = useMemo(
    () => [
      { length: 3, points: 30 },
      { length: 4, points: 35 },
      { length: 5, points: 35 },
    ],
    []
  );

  const [phase, setPhase] = useState("idle");
  const [roundIndex, setRoundIndex] = useState(0);
  const [sequence, setSequence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState(
    "Press start to begin the memory challenge."
  );

  useEffect(() => {
    let timeoutId;

    if (phase === "showing") {
      timeoutId = setTimeout(() => {
        setPhase("input");
        setMessage("Now type the sequence from memory.");
      }, 2200);
    }

    return () => clearTimeout(timeoutId);
  }, [phase]);

  const startRound = () => {
    const currentRound = rounds[roundIndex];
    const newSequence = generateSequence(currentRound.length);

    setSequence(newSequence);
    setUserInput("");
    setPhase("showing");
    setMessage("Memorize this sequence.");
  };

  const handleSubmit = () => {
    if (phase !== "input") return;

    const currentRound = rounds[roundIndex];
    const isCorrect = userInput.trim() === sequence;

    let newScore = score;
    if (isCorrect) {
      newScore += currentRound.points;
      setScore(newScore);
    }

    if (roundIndex < rounds.length - 1) {
      setRoundIndex((prev) => prev + 1);
      setPhase("feedback");
      setMessage(
        isCorrect
          ? `Correct! You earned ${currentRound.points} points.`
          : `Not quite. The correct sequence was ${sequence}.`
      );
    } else {
      setPhase("done");
      setMessage(
        isCorrect
          ? `Game complete! Final memory score: ${newScore}/100`
          : `Game complete! The correct sequence was ${sequence}. Final memory score: ${newScore}/100`
      );
      onComplete(newScore);
    }
  };

  const nextRound = () => {
    setPhase("idle");
    setMessage("Click start for the next round.");
  };

  const resetGame = () => {
    setPhase("idle");
    setRoundIndex(0);
    setSequence("");
    setUserInput("");
    setScore(0);
    setMessage("Press start to begin the memory challenge.");
  };

  const currentRoundNumber = Math.min(roundIndex + 1, rounds.length);

  const panelTone =
    phase === "showing"
      ? "from-violet-500/25 to-fuchsia-500/15 border-violet-400/30"
      : phase === "input"
      ? "from-cyan-500/20 to-sky-500/10 border-cyan-400/30"
      : phase === "done"
      ? "from-emerald-500/20 to-lime-500/10 border-emerald-400/30"
      : "from-slate-800/80 to-slate-900/80 border-white/10";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[28px] border bg-gradient-to-br p-8 ${panelTone}`}
      >
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
            Round {currentRoundNumber} / {rounds.length}
          </p>

          <h3 className="mt-4 text-3xl font-semibold text-white">{message}</h3>

          <div className="mt-8 min-h-[80px] flex items-center justify-center">
            {phase === "showing" ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-5xl font-bold tracking-[0.35em] text-white">
                {sequence}
              </div>
            ) : phase === "input" ? (
              <input
                type="text"
                value={userInput}
                onChange={(e) =>
                  setUserInput(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Type sequence here"
                className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-center text-2xl tracking-[0.25em] text-white outline-none"
              />
            ) : phase === "done" ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-8 py-5 text-4xl font-bold text-emerald-300">
                {score} / 100
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-lg text-slate-300">
                Ready when you are
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Current Score</p>
          <p className="mt-3 text-3xl font-semibold text-white">{score}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Saved Result</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {value ?? "Not set"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Challenge Type</p>
          <p className="mt-3 text-xl font-semibold text-white">
            Short-term Memory
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {phase === "idle" && (
          <button
            onClick={startRound}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02]"
          >
            Start Round
          </button>
        )}

        {phase === "input" && (
          <button
            onClick={handleSubmit}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02]"
          >
            Submit Answer
          </button>
        )}

        {phase === "feedback" && (
          <button
            onClick={nextRound}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02]"
          >
            Next Round
          </button>
        )}

        <button
          onClick={resetGame}
          className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}