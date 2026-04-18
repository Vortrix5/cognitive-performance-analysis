import { motion } from "motion/react";

const dietOptions = [
  {
    value: "Vegetarian",
    title: "Vegetarian",
    icon: "🥗",
    description: "Plant-based meals with dairy or eggs.",
    accent: "from-emerald-500/20 to-lime-500/10",
  },
  {
    value: "Non-Vegetarian",
    title: "Non-Vegetarian",
    icon: "🍗",
    description: "Mixed diet including meat or fish.",
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    value: "Vegan",
    title: "Vegan",
    icon: "🌱",
    description: "Fully plant-based food choices.",
    accent: "from-cyan-500/20 to-emerald-500/10",
  },
];

const exerciseOptions = [
  {
    value: "Low",
    title: "Low",
    icon: "🪑",
    description: "Little or infrequent physical activity.",
    accent: "from-slate-500/20 to-slate-400/10",
  },
  {
    value: "Medium",
    title: "Medium",
    icon: "🚶",
    description: "Moderate activity during the week.",
    accent: "from-sky-500/20 to-cyan-500/10",
  },
  {
    value: "High",
    title: "High",
    icon: "🏃",
    description: "Frequent or intense exercise habits.",
    accent: "from-fuchsia-500/20 to-violet-500/10",
  },
];

function OptionCard({ option, active, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-[24px] border p-5 text-left transition-all",
        active
          ? "border-white/20 shadow-lg shadow-cyan-500/10"
          : "border-white/10 bg-slate-900/70 hover:border-white/15",
      ].join(" ")}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${option.accent} ${
          active ? "opacity-100" : "opacity-70"
        }`}
      />
      <div className="relative z-10">
        <div className="text-3xl">{option.icon}</div>
        <h4 className="mt-4 text-xl font-semibold text-white">
          {option.title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {option.description}
        </p>
      </div>
    </motion.button>
  );
}

function SelectedInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">
        {value || "Not selected"}
      </p>
    </div>
  );
}

export default function LifestyleSelector({ diet, exercise, onDietChange, onExerciseChange }) {
  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
            Diet Profile
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-white">
            Choose your diet type
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dietOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              active={diet === option.value}
              onClick={() => onDietChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">
            Activity Profile
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-white">
            Choose your exercise frequency
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {exerciseOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              active={exercise === option.value}
              onClick={() => onExerciseChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectedInfo label="Selected Diet" value={diet} />
        <SelectedInfo label="Selected Exercise" value={exercise} />
      </div>
    </div>
  );
}