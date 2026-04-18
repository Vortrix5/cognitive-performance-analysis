import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export default function ReactionTest({ value, onComplete }) {
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("Press start to begin the reaction test.");
  const [round, setRound] = useState(1);
  const [results, setResults] = useState([]);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  const totalRounds = 3;

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const startRound = () => {
    setPhase("waiting");
    setMessage("Wait for the screen to change...");

    const delay = Math.floor(Math.random() * 2500) + 1500;

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setPhase("ready");
      setMessage("Click now!");
    }, delay);
  };

  const handleMainClick = () => {
    if (phase === "idle") {
      startRound();
      return;
    }

    if (phase === "waiting") {
      clearTimeout(timeoutRef.current);
      setPhase("idle");
      setMessage("Too early! Wait for the signal, then try again.");
      return;
    }

    if (phase === "ready") {
      const reactionTime = Date.now() - startTimeRef.current;
      const newResults = [...results, reactionTime];
      setResults(newResults);

      if (round < totalRounds) {
        setRound((prev) => prev + 1);
        setPhase("idle");
        setMessage(`Round ${round} complete: ${reactionTime} ms. Click to start next round.`);
      } else {
        const average = Math.round(
          newResults.reduce((a, b) => a + b, 0) / newResults.length
        );
        setPhase("done");
        setMessage(`Test complete. Your average reaction time is ${average} ms.`);
        onComplete(average);
      }
    }
  };

  const resetTest = () => {
    clearTimeout(timeoutRef.current);
    setPhase("idle");
    setMessage("Press start to begin the reaction test.");
    setRound(1);
    setResults([]);
  };

  const bgClass =
    phase === "ready"
      ? "from-emerald-500/30 to-lime-500/20 border-emerald-400/30"
      : phase === "waiting"
      ? "from-amber-500/20 to-orange-500/10 border-amber-400/20"
      : phase === "done"
      ? "from-cyan-500/20 to-sky-500/10 border-cyan-400/20"
      : "from-slate-800/80 to-slate-900/80 border-white/10";

  return (
    <div className="space-y-6">
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={handleMainClick}
        className={`flex h-72 w-full items-center justify-center rounded-[28px] border bg-gradient-to-br p-8 text-center transition-all ${bgClass}`}
      >
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
            Round {Math.min(round, totalRounds)} / {totalRounds}
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">{message}</p>
          <p className="mt-4 text-sm text-slate-300">
            {phase === "idle" && "Click anywhere in this box to start."}
            {phase === "waiting" && "Do not click yet."}
            {phase === "ready" && "Click as fast as you can."}
            {phase === "done" && "You can keep this result or reset the test."}
          </p>
        </div>
      </motion.button>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Recorded Rounds</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {results.length === 0 ? (
              <span className="text-slate-500">No rounds yet</span>
            ) : (
              results.map((item, index) => (
                <span
                  key={index}
                  className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200"
                >
                  {item} ms
                </span>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Selected Result</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {value ? `${value} ms` : "Not set"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetTest}
          className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800"
        >
          Reset Test
        </button>
      </div>
    </div>
  );
}