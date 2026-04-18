import { motion } from "motion/react";

const cups = [
  { count: 0, caffeine: 0, label: "No coffee" },
  { count: 1, caffeine: 95, label: "Light" },
  { count: 2, caffeine: 190, label: "Moderate" },
  { count: 3, caffeine: 285, label: "Regular" },
  { count: 4, caffeine: 380, label: "High" },
  { count: 5, caffeine: 475, label: "Very High" },
];

function CoffeeCup({ active, onClick, count }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={[
        "flex h-20 w-20 items-center justify-center rounded-[24px] border transition-all",
        active
          ? "border-amber-300/40 bg-amber-500/20 shadow-lg shadow-amber-500/10"
          : "border-white/10 bg-slate-900/70 hover:border-amber-400/20 hover:bg-amber-500/10",
      ].join(" ")}
    >
      <div className="text-center">
        <div className="text-3xl">☕</div>
        <div className="mt-1 text-xs text-slate-300">{count}</div>
      </div>
    </motion.button>
  );
}

export default function CaffeineSelector({ value, onChange }) {
  const selected =
    cups.find((item) => item.caffeine === value) || cups[0];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-200">
            Daily Coffee Intake
          </p>

          <h3 className="mt-4 text-3xl font-semibold text-white">
            How many cups of coffee do you usually drink?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Choose the option that best matches your average daily coffee
            intake. We’ll convert it into an estimated caffeine value.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {cups.map((item) => (
            <CoffeeCup
              key={item.count}
              count={item.count}
              active={selected.count === item.count}
              onClick={() => onChange(item.caffeine)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Selected Cups</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {selected.count}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Estimated Caffeine</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {selected.caffeine} mg
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Profile</p>
          <p className="mt-3 text-xl font-semibold text-white">
            {selected.label}
          </p>
        </div>
      </div>
    </div>
  );
}