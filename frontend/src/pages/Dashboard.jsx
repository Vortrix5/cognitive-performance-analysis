import { useEffect, useMemo, useState } from "react";
import PlotComponent from "react-plotly.js";
import { motion } from "motion/react";
import api from "../services/api";
import PageShell from "../components/PageShell";

const Plot = PlotComponent.default || PlotComponent;

function formatCompact(value) {
  if (typeof value !== "number") return value;
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getAverage(data, key) {
  if (!data.length) return 0;
  const values = data
    .map((row) => Number(row[key]))
    .filter((value) => !Number.isNaN(value));
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getPercentage(conditionCount, total) {
  if (!total) return "0%";
  return `${((conditionCount / total) * 100).toFixed(1)}%`;
}

function stressLabel(avgStress) {
  if (avgStress >= 7.5) return "High";
  if (avgStress >= 4.5) return "Moderate";
  return "Low";
}

function StatCard({ label, value, subtext, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative z-10">
        <p className="text-sm text-slate-300">{label}</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {value}
        </p>
        {subtext ? (
          <p className="mt-3 text-sm leading-6 text-slate-400">{subtext}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

function InsightCard({ title, value, description, tone = "slate", delay = 0 }) {
  const toneMap = {
    emerald: "from-emerald-500/15 to-lime-500/5 text-emerald-300",
    cyan: "from-cyan-500/15 to-sky-500/5 text-cyan-300",
    violet: "from-violet-500/15 to-fuchsia-500/5 text-violet-300",
    amber: "from-amber-500/15 to-orange-500/5 text-amber-300",
    slate: "from-slate-500/10 to-slate-400/5 text-slate-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneMap[tone] || toneMap.slate}`} />
      <div className="relative z-10">
        <p className="text-sm text-slate-300">{title}</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {value}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}

function MiniTrendCard({ title, value, description, accent, series, delay = 0 }) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1 || 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </div>

          <div className="h-20 w-32">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polyline
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="3"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 shadow-lg shadow-emerald-500/10">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
      </span>
      Live dataset
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, dataRes] = await Promise.all([
          api.get("/summary"),
          api.get("/data"),
        ]);

        setSummary(summaryRes.data);
        setData(Array.isArray(dataRes.data) ? dataRes.data.slice(0, 800) : []);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchData();
  }, []);

  const insights = useMemo(() => {
    if (!summary || !data.length) return null;

    const avgStress = getAverage(data, "Stress_Level");
    const avgReaction = getAverage(data, "Reaction_Time");
    const highPerformers = data.filter(
      (row) => Number(row.Cognitive_Score) >= 80
    ).length;
    const highPerformanceRate = getPercentage(highPerformers, data.length);

    const scoreSeries = data
      .slice(0, 24)
      .map((row) => Number(row.Cognitive_Score) || 0);

    const stressSeries = data
      .slice(0, 24)
      .map((row) => Number(row.Stress_Level) || 0);

    const reactionSeries = data
      .slice(0, 24)
      .map((row) => Number(row.Reaction_Time) || 0);

    return {
      avgStress: avgStress.toFixed(2),
      avgReaction: avgReaction.toFixed(0),
      stressClimate: stressLabel(avgStress),
      highPerformanceRate,
      scoreSeries,
      stressSeries,
      reactionSeries,
    };
  }, [summary, data]);

  if (!summary || !insights) {
    return <div className="text-slate-300">Loading dashboard...</div>;
  }

  return (
    <PageShell
      title="Dashboard"
      subtitle="A live overview of cognitive performance, behavioral signals, and model-facing patterns."
    >
      <div className="flex items-center justify-end">
        <LiveBadge />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rows"
          value={formatCompact(summary.rows)}
          subtext="Total records currently available in the active dataset."
          accent="from-cyan-500/15 to-sky-500/5"
          delay={0.02}
        />
        <StatCard
          label="Average Score"
          value={summary.avg_score}
          subtext="Mean cognitive score across all observations."
          accent="from-violet-500/15 to-fuchsia-500/5"
          delay={0.08}
        />
        <StatCard
          label="Max Score"
          value={summary.max_score}
          subtext="Peak cognitive score captured in the dataset."
          accent="from-emerald-500/15 to-lime-500/5"
          delay={0.14}
        />
        <StatCard
          label="Min Score"
          value={summary.min_score}
          subtext="Lowest recorded performance in the current distribution."
          accent="from-amber-500/15 to-orange-500/5"
          delay={0.2}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 xl:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-cyan-500/5 to-transparent" />
          <div className="relative z-10 mb-4">
            <h3 className="text-xl font-semibold text-white">Performance Signal Map</h3>
            <p className="mt-1 text-sm text-slate-400">
              Scatter distribution of memory performance against cognitive score, colored by stress level.
            </p>
          </div>

          <Plot
            data={[
              {
                x: data.map((row) => row.Memory_Test_Score),
                y: data.map((row) => row.Cognitive_Score),
                mode: "markers",
                type: "scatter",
                text: data.map(
                  (row) =>
                    `Memory: ${row.Memory_Test_Score}<br>Cognitive: ${row.Cognitive_Score}<br>Stress: ${row.Stress_Level}`
                ),
                marker: {
                  size: 10,
                  opacity: 0.8,
                  color: data.map((row) => row.Stress_Level),
                  colorscale: "Viridis",
                  line: {
                    color: "rgba(255,255,255,0.18)",
                    width: 1,
                  },
                  colorbar: {
                    title: "Stress",
                    tickfont: { color: "#e2e8f0" },
                    titlefont: { color: "#e2e8f0" },
                  },
                },
                hovertemplate: "%{text}<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 520,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#e2e8f0" },
              xaxis: {
                title: "Memory Test Score",
                gridcolor: "rgba(148,163,184,0.12)",
                zerolinecolor: "rgba(148,163,184,0.12)",
              },
              yaxis: {
                title: "Cognitive Score",
                gridcolor: "rgba(148,163,184,0.12)",
                zerolinecolor: "rgba(148,163,184,0.12)",
              },
              margin: { l: 60, r: 30, t: 20, b: 60 },
            }}
            config={{ responsive: true, displaylogo: false }}
            style={{ width: "100%" }}
          />
        </motion.div>

        <div className="space-y-6">
          <InsightCard
            title="Stress Climate"
            value={insights.stressClimate}
            description={`Average stress level is ${insights.avgStress}, indicating the overall dataset pressure profile.`}
            tone="emerald"
            delay={0.16}
          />
          <InsightCard
            title="High Performers"
            value={insights.highPerformanceRate}
            description="Share of observations with cognitive score at or above 80."
            tone="violet"
            delay={0.22}
          />
          <InsightCard
            title="Avg Reaction"
            value={`${insights.avgReaction} ms`}
            description="Mean reaction time across the currently loaded analytical sample."
            tone="cyan"
            delay={0.28}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <MiniTrendCard
          title="Score Pulse"
          value={summary.avg_score}
          description="Average score behavior across sampled observations."
          accent="from-violet-500/15 to-fuchsia-500/5"
          series={insights.scoreSeries}
          delay={0.1}
        />
        <MiniTrendCard
          title="Stress Pulse"
          value={insights.avgStress}
          description="Stress intensity signature inside the current sample."
          accent="from-emerald-500/15 to-lime-500/5"
          series={insights.stressSeries}
          delay={0.16}
        />
        <MiniTrendCard
          title="Reaction Pulse"
          value={`${insights.avgReaction} ms`}
          description="Reaction-time rhythm based on the currently visible records."
          accent="from-cyan-500/15 to-sky-500/5"
          series={insights.reactionSeries}
          delay={0.22}
        />
      </div>
    </PageShell>
  );
}