import { Link } from "react-router-dom";
import { motion } from "motion/react";

function ChoiceCard({ title, description, to, accent, badge, buttonText }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.015 }}
      transition={{ duration: 0.22 }}
    >
      <Link to={to} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-cyan-500/10">
          <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />

          <div className="relative z-10 flex h-full flex-col">
            {badge ? (
              <div className="mb-5 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                {badge}
              </div>
            ) : null}

            <h2 className="text-3xl font-semibold text-white">{title}</h2>

            <p className="mt-4 text-base leading-8 text-slate-300">
              {description}
            </p>

            <div className="mt-auto pt-8">
              <span className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition group-hover:scale-[1.03]">
                {buttonText}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-12 text-slate-100">
      <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-10 max-w-4xl text-center"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Cognitive AI Platform
          </p>

          <h1 className="mt-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-7xl">
            Cognitive Score Prediction
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-300 md:text-xl">
            Explore the data intelligence workspace or begin a guided prediction
            journey with interactive steps, mini-tests, and playful inputs.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <ChoiceCard
            title="Data Overview"
            description="Open the analytics workspace to explore the dashboard, data exploration, and model insights through a premium visual interface."
            buttonText="Open Analytics"
            to="/analytics"
            badge="Analytics"
            accent="from-cyan-500/15 via-sky-500/10 to-transparent"
          />

          <ChoiceCard
            title="Predict Cognitive Score"
            description="Start a guided multi-step experience with playful inputs such as reaction tests, memory games, and visual selections."
            buttonText="Start Prediction"
            to="/predict"
            badge="Interactive Journey"
            accent="from-fuchsia-500/15 via-violet-500/10 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}