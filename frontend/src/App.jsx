import { NavLink, Route, Routes } from "react-router-dom";
import { motion } from "motion/react";
import Landing from "./pages/Landing";
import PredictionWizard from "./pages/PredictionWizard";
import Dashboard from "./pages/Dashboard";
import EDA from "./pages/EDA";
import Modeling from "./pages/Modeling";

const navItems = [
  { to: "/analytics", label: "Dashboard" },
  { to: "/analytics/data", label: "Data Exploration" },
  { to: "/analytics/modeling", label: "Modeling" },
];

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/analytics"}
      className={({ isActive }) =>
        [
          "block rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-slate-200 text-slate-950 shadow-sm"
            : "text-slate-300 hover:bg-slate-800 hover:text-white",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function AnalyticsLayout() {
  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div className="flex h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
          <div className="flex h-full flex-col px-6 py-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Cognitive AI
              </p>

              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Analytics Suite
              </h1>
            </div>

            <nav className="mt-12 space-y-5">
              {navItems.map((item) => (
                <SidebarLink key={item.to} to={item.to} label={item.label} />
              ))}
            </nav>

            <div className="mt-auto">
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-lg shadow-emerald-500/10 backdrop-blur-md">
                <p className="text-sm text-emerald-200">System status</p>
                <p className="mt-3 text-4xl font-semibold text-emerald-400">
                  Online
                </p>
                <p className="mt-4 text-base leading-7 text-emerald-100/80">
                  Frontend and backend connected.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/data" element={<EDA />} />
                <Route path="/modeling" element={<Modeling />} />
              </Routes>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/predict" element={<PredictionWizard />} />
      <Route path="/analytics/*" element={<AnalyticsLayout />} />
    </Routes>
  );
}