import { motion } from "motion/react";

const stressLevels = [
  { value: 1, label: "Very Calm", emoji: "😌", tone: "bg-emerald-500/15 border-emerald-400/25 text-emerald-200" },
  { value: 2, label: "Calm", emoji: "🙂", tone: "bg-emerald-500/15 border-emerald-400/25 text-emerald-200" },
  { value: 3, label: "Relaxed", emoji: "😊", tone: "bg-lime-500/15 border-lime-400/25 text-lime-200" },
  { value: 4, label: "Balanced", emoji: "😐", tone: "bg-cyan-500/15 border-cyan-400/25 text-cyan-200" },
  { value: 5, label: "Aware", emoji: "🫤", tone: "bg-cyan-500/15 border-cyan-400/25 text-cyan-200" },
  { value: 6, label: "Tense", emoji: "😕", tone: "bg-amber-500/15 border-amber-400/25 text-amber-200" },
  { value: 7, label: "Stressed", emoji: "😣", tone: "bg-amber-500/15 border-amber-400/25 text-amber-200" },
  { value: 8, label: "Overloaded", emoji: "😫", tone: "bg-orange-500/15 border-orange-400/25 text-orange-200" },
  { value: 9, label: "Very Stressed", emoji: "😵", tone: "bg-rose-500/15 border-rose-400/25 text-rose-200" },
  { value: 10, label: "Extreme", emoji: "🤯", tone: "bg-fuchsia-500/15 border-fuchsia-400/25 text-fuchsia-200" },
];

function StressCard({ item, active, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        "rounded-[22px] border p-4 text-center transition-all",
        item.tone,
        active ? "ring-2 ring-white/30 shadow-lg shadow-slate-950/30" : "opacity-90 hover:opacity-100",
      ].join(" ")}
    >
      <div className="text-3xl">{item.emoji}</div>
      <div className="mt-3 text-2xl font-semibold">{item.value}</div>
      <div className="mt-1 text-sm">{item.label}</div>
    </motion.button>
  );
}

export default function StressSelector({ value, onChange }) {
  const selected = stressLevels.find((item) => item.value === value);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-5 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-rose-200">
            Stress Evaluation
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-white">
            How stressed do you usually feel?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Pick the level that best represents your typical stress condition.
            Lower values mean calmer states, while higher values indicate stronger stress.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stressLevels.map((item) => (
            <StressCard
              key={item.value}
              item={item}
              active={value === item.value}
              onClick={() => onChange(item.value)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Selected Level</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {value ?? "Not selected"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Current Mood</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {selected ? `${selected.emoji} ${selected.label}` : "Not selected"}
          </p>
        </div>
      </div>
    </div>
  );
}