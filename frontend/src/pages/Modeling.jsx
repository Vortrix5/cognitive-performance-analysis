import { useEffect, useState } from "react";
import PlotComponent from "react-plotly.js";
import api from "../services/api";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";

const Plot = PlotComponent.default || PlotComponent;

function SectionCard({ title, children, rightSlot }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {rightSlot}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Modeling() {
  const [metrics, setMetrics] = useState(null);
  const [importance, setImportance] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [k, setK] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModelingData = async () => {
      try {
        setLoading(true);
        setError("");

        const [metricsRes, importanceRes, clustersRes] = await Promise.all([
          api.get("/model-metrics"),
          api.get("/feature-importance"),
          api.get(`/clusters/${k}`),
        ]);

        setMetrics(metricsRes.data || null);
        setImportance(Array.isArray(importanceRes.data) ? importanceRes.data : []);
        setClusters(Array.isArray(clustersRes.data) ? clustersRes.data.slice(0, 1000) : []);
      } catch (err) {
        console.error("Error loading modeling data:", err);
        setError("Failed to load modeling data.");
      } finally {
        setLoading(false);
      }
    };

    if (k >= 2 && k <= 10) {
      fetchModelingData();
    }
  }, [k]);

  if (loading) {
    return <div className="text-slate-300">Loading modeling...</div>;
  }

  if (error) {
    return <div className="text-rose-400">{error}</div>;
  }

  return (
    <PageShell
      title="Modeling"
      subtitle="Review model quality, feature impact, and unsupervised clustering."
    >
      {metrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="R² Score" value={metrics.r2_score ?? "N/A"} />
          <StatCard label="RMSE" value={metrics.rmse ?? "N/A"} />
          <StatCard label="Accuracy" value={metrics.accuracy ?? "N/A"} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Feature Importance">
          {importance.length > 0 ? (
            <Plot
              data={[
                {
                  x: importance.map((item) => item.importance),
                  y: importance.map((item) => item.feature),
                  type: "bar",
                  orientation: "h",
                },
              ]}
              layout={{
                autosize: true,
                height: 480,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "#e2e8f0" },
                xaxis: {
                  title: "Importance",
                  gridcolor: "rgba(148,163,184,0.15)",
                },
                yaxis: {
                  title: "Feature",
                  gridcolor: "rgba(148,163,184,0.15)",
                },
                margin: { l: 160, r: 20, t: 20, b: 60 },
              }}
              config={{ responsive: true, displaylogo: false }}
              style={{ width: "100%" }}
            />
          ) : (
            <p className="text-slate-400">No feature importance data available.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Cluster Settings"
          rightSlot={
            <div className="flex items-center gap-3">
              <label htmlFor="k-input" className="text-sm text-slate-400">
                K Value
              </label>
              <input
                id="k-input"
                type="number"
                min="2"
                max="10"
                value={k}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 2 && value <= 10) {
                    setK(value);
                  }
                }}
                className="w-24 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-slate-500"
              />
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Current K</p>
              <p className="mt-2 text-3xl font-semibold text-white">{k}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Plotted Samples</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {clusters.length}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={`K-Means Clustering (K=${k})`}>
        {clusters.length > 0 ? (
          <Plot
            data={[
              {
                x: clusters.map((row) => row.Memory_Test_Score),
                y: clusters.map((row) => row.Cognitive_Score),
                mode: "markers",
                type: "scatter",
                text: clusters.map((row) => `Cluster: ${row.Cluster}`),
                marker: {
                  color: clusters.map((row) => row.Cluster),
                  size: 8,
                  opacity: 0.8,
                },
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
                gridcolor: "rgba(148,163,184,0.15)",
              },
              yaxis: {
                title: "Cognitive Score",
                gridcolor: "rgba(148,163,184,0.15)",
              },
              margin: { l: 60, r: 20, t: 20, b: 60 },
            }}
            config={{ responsive: true, displaylogo: false }}
            style={{ width: "100%" }}
          />
        ) : (
          <p className="text-slate-400">No clustering data available.</p>
        )}
      </SectionCard>
    </PageShell>
  );
}