import { useState } from "react";
import { motion } from "motion/react";
import api from "../services/api";
import ReactionTest from "../components/ReactionTest";
import MemoryGame from "../components/MemoryGame";
import CaffeineSelector from "../components/CaffeineSelector";
import LifestyleSelector from "../components/LifestyleSelector";
import StressSelector from "../components/StressSelector";

const steps = [
  "Welcome",
  "Personal Info",
  "Reaction Test",
  "Memory Game",
  "Caffeine",
  "Lifestyle",
  "Stress",
  "Review",
  "Result",
];

function StepCard({ title, description, children }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
      <h2 className="text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-300">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value, tone = "slate" }) {
  const tones = {
    slate: "border-white/10 bg-slate-950/70",
    cyan: "border-cyan-400/20 bg-cyan-500/10",
    violet: "border-violet-400/20 bg-violet-500/10",
    amber: "border-amber-400/20 bg-amber-500/10",
    emerald: "border-emerald-400/20 bg-emerald-500/10",
    rose: "border-rose-400/20 bg-rose-500/10",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value || "Not set"}</p>
    </div>
  );
}

export default function PredictionWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: null,
    gender: "",
    reaction: null,
    memory: null,
    caffeine: 0,
    diet: "",
    exercise: "",
    stress: null,
  });

function buildInterpretation(prediction) {
  if (!prediction?.shap_explanation) {
    return "This result is based on your reaction speed, memory performance, caffeine intake, lifestyle choices, and stress level.";
  }

  const topPositive = prediction.shap_explanation.top_positive || [];
  const topNegative = prediction.shap_explanation.top_negative || [];
  const level = prediction.cognitive_level;

  const bestPositive = topPositive[0]?.label;
  const neg1 = topNegative[0]?.label;
  const neg2 = topNegative[1]?.label;

  if (level === "High") {
    if (bestPositive && neg1) {
      return `Your result is supported mainly by ${bestPositive}, although ${neg1} still slightly limits the score.`;
    }
    if (bestPositive) {
      return `Your result is strongly supported by ${bestPositive}.`;
    }
  }

  if (level === "Medium") {
    if (bestPositive && neg1 && neg2) {
      return `Your profile is mixed: ${bestPositive} supports the score, while ${neg1} and ${neg2} reduce it.`;
    }
    if (bestPositive && neg1) {
      return `Your score is balanced between positive support from ${bestPositive} and downward pressure from ${neg1}.`;
    }
  }

  if (level === "Low") {
    if (bestPositive && neg1 && neg2) {
      return `Your score is mainly lowered by ${neg1} and ${neg2}, while ${bestPositive} is your strongest supporting factor.`;
    }
    if (neg1 && bestPositive) {
      return `Your score is mainly lowered by ${neg1}, while ${bestPositive} helps support it.`;
    }
    if (neg1) {
      return `Your score is mainly influenced by ${neg1}.`;
    }
  }

  if (bestPositive && neg1 && neg2) {
    return `Your score is mainly lowered by ${neg1} and ${neg2}, while ${bestPositive} is your strongest supporting factor.`;
  }

  if (bestPositive && neg1) {
    return `Your score is influenced by ${neg1}, while ${bestPositive} helps support it.`;
  }

  return "This result is based on your reaction speed, memory performance, caffeine intake, lifestyle choices, and stress level.";
}

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [simulationData, setSimulationData] = useState(null);
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState("");
  const [simulationInsight, setSimulationInsight] = useState(null);
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

const generatePrediction = async () => {
  try {
    setPredicting(true);
    setPredictionError("");
    setSimulationError("");
    setSimulatedResult(null);
    setSimulationInsight(null);

    const res = await api.post("/predict-explain", formData);
    setPrediction(res.data);
    setSimulationData({ ...formData });
    setCurrentStep(8);
  } catch (error) {
    console.error("Prediction request failed:", error);
    setPredictionError("Failed to generate prediction. Please check your inputs and backend.");
  } finally {
    setPredicting(false);
  }
};
const generateSimulationInsight = (
  originalData,
  newData,
  originalResult,
  newResult
) => {
  if (!originalResult || !newResult) return null;

  const diff = newResult.predicted_score - originalResult.predicted_score;

  const changedField = Object.keys(newData).find(
    (key) => newData[key] !== originalData[key]
  );

  if (!changedField) return null;

  const labelMap = {
    stress: "stress level",
    caffeine: "caffeine intake",
    exercise: "exercise frequency",
    diet: "diet type",
    reaction: "reaction time",
    memory: "memory test score",
  };

  const fieldLabel = labelMap[changedField] || changedField;

  let direction = "neutral";
  let summary = "This change has little effect on the predicted score.";
  let advice = "You may want to try changing another factor to see a clearer effect.";

  if (diff > 0.5) {
    direction = "better";
    summary = `Changing ${fieldLabel} improved the predicted score by ${diff.toFixed(2)} points.`;
    if (changedField === "stress") {
      advice = "Lower stress appears favorable for this profile. Keeping stress under control may support better cognitive performance.";
    } else if (changedField === "caffeine") {
      advice = "This caffeine change seems beneficial in the model. Moderate intake may be a better fit for this profile.";
    } else if (changedField === "exercise") {
      advice = "A stronger exercise routine appears favorable here. More regular physical activity may support better performance.";
    } else if (changedField === "diet") {
      advice = "This diet choice appears more favorable in the model for this profile.";
    } else if (changedField === "memory") {
      advice = "Improving memory-test-related performance has a positive effect in the model.";
    } else if (changedField === "reaction") {
      advice = "A better reaction-time value improves the predicted result in the model.";
    } else {
      advice = `This change in ${fieldLabel} appears favorable for this profile.`;
    }
  } else if (diff < -0.5) {
    direction = "worse";
    summary = `Changing ${fieldLabel} lowered the predicted score by ${Math.abs(diff).toFixed(2)} points.`;
    if (changedField === "stress") {
      advice = "Higher stress appears unfavorable for this profile. Reducing stress may help support better results.";
    } else if (changedField === "caffeine") {
      advice = "This caffeine change seems less favorable in the model. Keeping intake moderate may be better.";
    } else if (changedField === "exercise") {
      advice = "This exercise change appears less favorable. A more regular routine may support stronger results.";
    } else if (changedField === "diet") {
      advice = "This diet change appears less favorable for this profile in the current model.";
    } else if (changedField === "memory") {
      advice = "Lower memory-test-related performance reduces the predicted result in the model.";
    } else if (changedField === "reaction") {
      advice = "A worse reaction-time value lowers the predicted result in the model.";
    } else {
      advice = `This change in ${fieldLabel} appears less favorable for this profile.`;
    }
  }

  return {
    direction,
    summary,
    advice,
    changedField,
    difference: diff,
  };
};
  const runSimulation = async (updatedField, newValue) => {
  if (!simulationData || !prediction) return;

  const nextSimulationData = {
    ...simulationData,
    [updatedField]: newValue,
  };

  setSimulationData(nextSimulationData);
  setSimulationError("");

  try {
    setSimulating(true);
    const res = await api.post("/predict", nextSimulationData);
    setSimulatedResult(res.data);

    const insight = generateSimulationInsight(
      formData,
      nextSimulationData,
      prediction,
      res.data
    );
    setSimulationInsight(insight);
  } catch (error) {
    console.error("Simulation request failed:", error);
    setSimulationError("Failed to simulate the new scenario.");
  } finally {
    setSimulating(false);
  }
};

const restartJourney = () => {
  setCurrentStep(0);
  setFormData({
    age: null,
    gender: "",
    reaction: null,
    memory: null,
    caffeine: 0,
    diet: "",
    exercise: "",
    stress: null,
  });
  setPrediction(null);
  setPredictionError("");
  setSimulationData(null);
  setSimulating(false);
  setSimulatedResult(null);
  setSimulationError("");
  setSimulationInsight(null);
  setSimulating(false);
};
const buildQuickSummary = (level, shap) => {
  if (!level) return "No summary available.";

  let text = `Your cognitive performance is currently at a ${level} level.`;

  if (shap?.top_positive?.length) {
    text += ` Strong contributors include ${shap.top_positive[0].label}.`;
  }

  if (shap?.top_negative?.length) {
    text += ` Factors that may be limiting performance include ${shap.top_negative[0].label}.`;
  }

  return text;
};
const impact =
  simulatedResult && prediction
    ? simulatedResult.predicted_score - prediction.predicted_score
    : 0;

const impactText =
  impact > 0 ? `+${impact.toFixed(2)}` : impact.toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </p>

          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <span
                key={step}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  index === currentStep
                    ? "bg-white text-slate-950"
                    : index < currentStep
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {currentStep === 0 && (
            <StepCard
              title="Prediction Journey"
              description="You’ll go through a guided sequence with interactive steps. Some steps use real mini-experiences instead of plain form fields."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-sm text-cyan-200">Reaction Test</p>
                  <p className="mt-2 text-slate-200">
                    Measure your real response speed.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
                  <p className="text-sm text-violet-200">Memory Game</p>
                  <p className="mt-2 text-slate-200">
                    Play a short challenge for memory score.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-200">Lifestyle Inputs</p>
                  <p className="mt-2 text-slate-200">
                    Use playful controls instead of plain forms.
                  </p>
                </div>
              </div>
            </StepCard>
          )}

          {currentStep === 1 && (
            <StepCard
              title="Personal Information"
              description="We’ll start with your basic profile."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Age</label>
                  <input
                    type="number"
                    value={formData.age ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, age: Number(e.target.value) })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </StepCard>
          )}

          {currentStep === 2 && (
            <StepCard
              title="Reaction Test"
              description="Measure your real response speed. Complete the rounds and we’ll use your average reaction time."
            >
              <ReactionTest
                value={formData.reaction}
                onComplete={(reactionValue) =>
                  setFormData({ ...formData, reaction: reactionValue })
                }
              />
            </StepCard>
          )}

          {currentStep === 3 && (
            <StepCard
              title="Memory Game"
              description="Watch each sequence carefully, memorize it, and type it back from memory."
            >
              <MemoryGame
                value={formData.memory}
                onComplete={(memoryValue) =>
                  setFormData({ ...formData, memory: memoryValue })
                }
              />
            </StepCard>
          )}

          {currentStep === 4 && (
            <StepCard
              title="Caffeine Intake"
              description="Select your usual daily coffee intake using the visual coffee cups below."
            >
              <CaffeineSelector
                value={formData.caffeine}
                onChange={(caffeineValue) =>
                  setFormData({ ...formData, caffeine: caffeineValue })
                }
              />
            </StepCard>
          )}

          {currentStep === 5 && (
            <StepCard
              title="Lifestyle Profile"
              description="Choose the diet and activity pattern that best matches your routine."
            >
              <LifestyleSelector
                diet={formData.diet}
                exercise={formData.exercise}
                onDietChange={(dietValue) =>
                  setFormData({ ...formData, diet: dietValue })
                }
                onExerciseChange={(exerciseValue) =>
                  setFormData({ ...formData, exercise: exerciseValue })
                }
              />
            </StepCard>
          )}

          {currentStep === 6 && (
            <StepCard
              title="Stress Evaluation"
              description="Choose the stress level that best reflects your usual condition."
            >
              <StressSelector
                value={formData.stress}
                onChange={(stressValue) =>
                  setFormData({ ...formData, stress: stressValue })
                }
              />
            </StepCard>
          )}

          {currentStep === 7 && (
            <StepCard
              title="Review Your Inputs"
              description="Check your results before generating the final prediction."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ReviewItem label="Age" value={formData.age} tone="cyan" />
                <ReviewItem label="Gender" value={formData.gender} tone="cyan" />
                <ReviewItem
                  label="Reaction Time"
                  value={formData.reaction ? `${formData.reaction} ms` : null}
                  tone="violet"
                />
                <ReviewItem
                  label="Memory Score"
                  value={formData.memory}
                  tone="violet"
                />
                <ReviewItem
                  label="Caffeine Intake"
                  value={`${formData.caffeine} mg`}
                  tone="amber"
                />
                <ReviewItem label="Diet Type" value={formData.diet} tone="emerald" />
                <ReviewItem
                  label="Exercise Frequency"
                  value={formData.exercise}
                  tone="emerald"
                />
                <ReviewItem
                  label="Stress Level"
                  value={formData.stress}
                  tone="rose"
                />
              </div>

              {predictionError ? (
                <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-200">
                  {predictionError}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={generatePrediction}
                  disabled={predicting}
                  className="rounded-2xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {predicting ? "Generating..." : "Generate Prediction"}
                </button>
              </div>
            </StepCard>
          )}

          {currentStep === 8 && (
  <StepCard
    eyebrow="Prediction Outcome"
    title="Your cognitive performance snapshot"
    description="Review your predicted score, the main feature influences, and explore how changing lifestyle factors affects the result."
  >
    {prediction ? (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ReviewItem
            label="Predicted Score"
            value={prediction.predicted_score}
            tone="violet"
          />
          <ReviewItem
            label="Cognitive Level"
            value={prediction.cognitive_level}
            tone="cyan"
          />
          <ReviewItem
            label="Baseline Value"
            value={prediction.shap_explanation?.baseline_value ?? "—"}
            tone="emerald"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="text-sm text-slate-300">Quick Summary</p>
          <p className="mt-2 text-slate-100">
            {buildQuickSummary(
              prediction.cognitive_level,
              prediction.shap_explanation
            )}
          </p>
        </div>

        {prediction.shap_explanation && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <p className="text-sm font-semibold text-emerald-300">
                Top Positive Factors
              </p>
              <div className="mt-4 space-y-3">
                {prediction.shap_explanation.top_positive?.length ? (
                  prediction.shap_explanation.top_positive.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.label}</p>
                        <span className="text-sm text-emerald-300">
                          +{item.shap_value}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">
                        Value: {item.value}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-300">
                    No strong positive contributors identified.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5">
              <p className="text-sm font-semibold text-rose-300">
                Top Negative Factors
              </p>
              <div className="mt-4 space-y-3">
                {prediction.shap_explanation.top_negative?.length ? (
                  prediction.shap_explanation.top_negative.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.label}</p>
                        <span className="text-sm text-rose-300">
                          {item.shap_value}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">
                        Value: {item.value}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-300">
                    No strong negative contributors identified.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {prediction.ai_insight && (
          <div className="rounded-[28px] border border-cyan-400/20 bg-slate-900/80 p-6">
            <h3 className="text-2xl font-semibold text-white">
              AI Interpretation
            </h3>
            <p className="mt-3 text-slate-200">{prediction.ai_insight.summary}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-slate-300">Key Reasons</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-100">
                  {prediction.ai_insight.key_reasons?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-slate-300">Suggestions</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-100">
                  {prediction.ai_insight.suggestions?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-300">
              {prediction.ai_insight.disclaimer}
            </p>
          </div>
        )}

        <div className="rounded-[28px] border border-fuchsia-400/20 bg-slate-900/70 p-6">
          <h3 className="text-2xl font-semibold text-white">What-if Simulator</h3>
          <p className="mt-2 text-slate-300">
            Try changing one factor and see how the predicted score changes.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Exercise Frequency
              </label>
              <select
                value={simulationData?.exercise ?? formData.exercise ?? ""}
                onChange={(e) => runSimulation("exercise", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Diet Type
              </label>
              <select
                value={simulationData?.diet ?? formData.diet ?? ""}
                onChange={(e) => runSimulation("diet", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Stress Level: {simulationData?.stress ?? formData.stress}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={simulationData?.stress ?? formData.stress ?? 0}
                onChange={(e) => runSimulation("stress", Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Caffeine Intake: {simulationData?.caffeine ?? formData.caffeine} mg
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={simulationData?.caffeine ?? formData.caffeine ?? 0}
                onChange={(e) => runSimulation("caffeine", Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {simulating && (
            <p className="mt-4 text-sm text-cyan-300">Running simulation...</p>
          )}

          {simulationError && (
            <p className="mt-4 text-sm text-rose-300">{simulationError}</p>
          )}

          {simulatedResult && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <ReviewItem
                  label="Original Score"
                  value={prediction.predicted_score}
                  tone="violet"
                />
                <ReviewItem
                  label="Simulated Score"
                  value={simulatedResult.predicted_score}
                  tone="cyan"
                />
                <ReviewItem
                  label="Impact"
                  value={impactText}
                  tone={impact >= 0 ? "emerald" : "rose"}
                />
              </div>

              <p className="mt-4 text-sm text-slate-300">
                Simulated level:{" "}
                <span className="font-semibold text-white">
                  {simulatedResult.cognitive_level}
                </span>
              </p>
            </>
          )}

          {simulationInsight && (
            <div className="mt-6 rounded-[24px] border border-cyan-400/20 bg-slate-950/80 p-5">
              <h4 className="text-lg font-semibold text-white">
                Simulation Insight
              </h4>
              <p className="mt-3 text-slate-200">{simulationInsight.summary}</p>
              <p className="mt-2 text-sm text-slate-300">
                {simulationInsight.advice}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={restartJourney}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02]"
          >
            Start Again
          </button>
        </div>
      </div>
    ) : (
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-slate-300">
        No prediction result yet.
      </div>
    )}
  </StepCard>
)}
        </motion.div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1 || currentStep === 7}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}