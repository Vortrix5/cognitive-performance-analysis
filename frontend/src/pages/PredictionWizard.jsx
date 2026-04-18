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

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

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

      const res = await api.post("/predict", formData);
      setPrediction(res.data);
      setCurrentStep(8);
    } catch (error) {
      console.error("Prediction request failed:", error);
      setPredictionError("Failed to generate prediction. Please check your inputs and backend.");
    } finally {
      setPredicting(false);
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
  };

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
              title="Prediction Result"
              description="Here is your estimated cognitive performance result."
            >
              {prediction ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-6">
                      <p className="text-sm text-cyan-200">Predicted Score</p>
                      <p className="mt-4 text-5xl font-semibold text-white">
                        {prediction.predicted_score}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-6">
                      <p className="text-sm text-fuchsia-200">Cognitive Level</p>
                      <p className="mt-4 text-5xl font-semibold text-white">
                        {prediction.cognitive_level}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6">
                    <p className="text-sm text-emerald-200">Interpretation</p>
                    <p className="mt-4 text-lg leading-8 text-emerald-50">
                      This result is based on your reaction speed, memory performance,
                      caffeine intake, lifestyle choices, and stress level.
                    </p>
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