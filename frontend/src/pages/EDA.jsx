import { useEffect, useMemo, useState } from "react";
import PlotComponent from "react-plotly.js";
import { motion } from "motion/react";
import api from "../services/api";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";

const Plot = PlotComponent.default || PlotComponent;

function SectionCard({ title, subtitle, children, accent = "from-indigo-500/20 to-cyan-500/10" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative z-10">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function MetricHighlightCard({ title, avg, min, max, accent }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 p-5 shadow-xl`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-90`} />
      <div className="relative z-10">
        <p className="text-sm text-slate-300">{title}</p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{avg}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
          average
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
            <p className="text-slate-400">Min</p>
            <p className="mt-1 text-lg font-medium text-white">{min}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
            <p className="text-slate-400">Max</p>
            <p className="mt-1 text-lg font-medium text-white">{max}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getChipStyle(label) {
  if (label === "Cognitive_Score" || label === "Cognitive_Class") {
    return "border-violet-400/30 bg-violet-500/10 text-violet-200";
  }
  if (label.includes("Stress")) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }
  if (label.includes("Memory") || label.includes("Reaction")) {
    return "border-cyan-400/30 bg-cyan-500/10 text-cyan-200";
  }
  if (
    label.includes("Diet") ||
    label.includes("Exercise") ||
    label.includes("Sleep") ||
    label.includes("Caffeine") ||
    label.includes("Screen")
  ) {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  }
  return "border-slate-600/40 bg-slate-800/60 text-slate-200";
}

function FeatureChip({ label, index }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.025 }}
      whileHover={{ y: -2, scale: 1.03 }}
      className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium shadow-lg ${getChipStyle(label)}`}
    >
      {label}
    </motion.span>
  );
}

function SampleCard({ row, index }) {
  const stress = Number(row.Stress_Level ?? 0);
  const stressTone =
    stress >= 8
      ? "text-rose-300 bg-rose-500/10 border-rose-400/20"
      : stress >= 5
      ? "text-amber-300 bg-amber-500/10 border-amber-400/20"
      : "text-emerald-300 bg-emerald-500/10 border-emerald-400/20";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 p-5 shadow-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Profile {String(index + 1).padStart(2, "0")}
            </p>
            <h4 className="mt-2 text-lg font-semibold text-white">
              Cognitive Snapshot
            </h4>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/20 text-lg font-semibold text-white">
            {row.Age}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">Score</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {row.Cognitive_Score}
            </p>
          </div>

          <div className={`rounded-2xl border p-3 ${stressTone}`}>
            <p className="text-xs opacity-80">Stress</p>
            <p className="mt-1 text-2xl font-semibold">{row.Stress_Level}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">Memory</p>
            <p className="mt-1 text-lg font-medium text-white">
              {row.Memory_Test_Score}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">Reaction</p>
            <p className="mt-1 text-lg font-medium text-white">
              {row.Reaction_Time}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">Caffeine</p>
            <p className="mt-1 text-lg font-medium text-white">
              {row.Caffeine_Intake}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">Exercise</p>
            <p className="mt-1 text-lg font-medium text-white">
              {row.Exercise_Frequency}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getNumericColumns(data, columns) {
  return columns.filter((col) =>
    data.some((row) => typeof row[col] === "number" && !Number.isNaN(row[col]))
  );
}

function getStats(data, column) {
  const values = data
    .map((row) => Number(row[column]))
    .filter((value) => !Number.isNaN(value));

  if (!values.length) {
    return { min: "N/A", avg: "N/A", max: "N/A" };
  }

  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);
  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);

  return { min, avg, max };
}

export default function EDA() {
  const [data, setData] = useState([]);
  const [feature, setFeature] = useState("Age");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEDAData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/data");
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("EDA error:", err);
        setError("Failed to load data explorer content.");
      } finally {
        setLoading(false);
      }
    };

    fetchEDAData();
  }, []);

  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]);
  }, [data]);

  const numericColumns = useMemo(() => {
    if (!data.length) return [];
    return getNumericColumns(data, columns);
  }, [data, columns]);

  useEffect(() => {
    if (numericColumns.length && !numericColumns.includes(feature)) {
      setFeature(numericColumns[0]);
    }
  }, [numericColumns, feature]);

  const cognitiveStats = getStats(data, "Cognitive_Score");
  const stressStats = getStats(data, "Stress_Level");
  const reactionStats = getStats(data, "Reaction_Time");
  const memoryStats = getStats(data, "Memory_Test_Score");

  const avgScore =
    data.length > 0
      ? (
          data.reduce((acc, row) => acc + Number(row.Cognitive_Score || 0), 0) /
          data.length
        ).toFixed(2)
      : "N/A";

  if (loading) return <div className="text-slate-300">Loading data explorer...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;

  return (
    <PageShell
      title="Data Explorer"
      subtitle="Explore the shape, behavior, and signal patterns inside your cognitive dataset."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rows" value={data.length} />
        <StatCard label="Columns" value={columns.length} />
        <StatCard label="Numeric Features" value={numericColumns.length} />
        <StatCard label="Average Score" value={avgScore} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Signal Distribution"
            subtitle="Inspect the spread of any numeric feature."
            accent="from-fuchsia-500/15 via-violet-500/10 to-cyan-500/10"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Select a feature and watch the distribution update instantly.
              </p>

              <select
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-fuchsia-400/40"
              >
                {numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <Plot
              data={[
                {
                  x: data.map((row) => row[feature]),
                  type: "histogram",
                  opacity: 0.85,
                  marker: {
                    color: "#8b5cf6",
                    line: { width: 1, color: "#22d3ee" },
                  },
                },
              ]}
              layout={{
                autosize: true,
                height: 460,
                title: `Distribution of ${feature}`,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "#e2e8f0" },
                xaxis: {
                  title: feature,
                  gridcolor: "rgba(148,163,184,0.12)",
                },
                yaxis: {
                  title: "Count",
                  gridcolor: "rgba(148,163,184,0.12)",
                },
                margin: { l: 60, r: 20, t: 60, b: 60 },
              }}
              config={{ responsive: true, displaylogo: false }}
              style={{ width: "100%" }}
            />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Explorer Pulse"
            subtitle="Live contextual summary"
            accent="from-emerald-500/15 to-cyan-500/10"
          >
            <div className="space-y-4">
              <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-200">Focused feature</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-300">
                  {feature}
                </p>
              </div>

              <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-200">Target variable</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  Cognitive_Score
                </p>
              </div>

              <div className="rounded-[22px] border border-violet-400/20 bg-violet-500/10 p-4">
                <p className="text-sm text-violet-200">Interpretation</p>
                <p className="mt-2 text-sm leading-6 text-violet-100/90">
                  This section highlights the active feature and helps the user
                  navigate the dataset through visual patterns rather than raw rows.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Feature Galaxy"
        subtitle="A categorized visual inventory of the available signals."
        accent="from-cyan-500/10 via-slate-500/5 to-violet-500/10"
      >
        <div className="flex flex-wrap gap-3">
          {columns.map((col, index) => (
            <FeatureChip key={col} label={col} index={index} />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Key Signal Statistics"
          subtitle="Core metrics presented as insight cards."
          accent="from-cyan-500/10 to-blue-500/5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <MetricHighlightCard
              title="Cognitive Score"
              avg={cognitiveStats.avg}
              min={cognitiveStats.min}
              max={cognitiveStats.max}
              accent="from-violet-500/20 to-fuchsia-500/10"
            />
            <MetricHighlightCard
              title="Stress Level"
              avg={stressStats.avg}
              min={stressStats.min}
              max={stressStats.max}
              accent="from-emerald-500/20 to-lime-500/10"
            />
            <MetricHighlightCard
              title="Reaction Time"
              avg={reactionStats.avg}
              min={reactionStats.min}
              max={reactionStats.max}
              accent="from-cyan-500/20 to-sky-500/10"
            />
            <MetricHighlightCard
              title="Memory Test Score"
              avg={memoryStats.avg}
              min={memoryStats.min}
              max={memoryStats.max}
              accent="from-amber-500/20 to-orange-500/10"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Sample Personas"
          subtitle="Illustrative snapshots from the dataset."
          accent="from-fuchsia-500/10 to-slate-500/5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {data.slice(0, 4).map((row, index) => (
              <SampleCard key={index} row={row} index={index} />
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}