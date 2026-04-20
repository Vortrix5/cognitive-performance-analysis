import { useState } from "react";
import api from "../services/api";

export default function Prediction() {
  const [formData, setFormData] = useState({
    age: 25,
    reaction: 250,
    memory: 50,
    caffeine: 100,
    gender: "Male",
    diet: "Vegetarian",
    exercise: "Medium",
    stress: 5,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "age" ||
        name === "reaction" ||
        name === "memory" ||
        name === "caffeine" ||
        name === "stress"
          ? Number(value)
          : value,
    }));
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await api.post("/predict-explain", formData);
      setResult(res.data);
    } catch (error) {
      console.error("Prediction error:", error);
      setError("Failed to fetch prediction explanation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Prediction</h1>

      <input
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
        placeholder="Age"
      />
      <input
        name="reaction"
        type="number"
        value={formData.reaction}
        onChange={handleChange}
        placeholder="Reaction Time"
      />
      <input
        name="memory"
        type="number"
        value={formData.memory}
        onChange={handleChange}
        placeholder="Memory Score"
      />
      <input
        name="caffeine"
        type="number"
        value={formData.caffeine}
        onChange={handleChange}
        placeholder="Caffeine Intake"
      />

      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>

      <select name="diet" value={formData.diet} onChange={handleChange}>
        <option>Vegetarian</option>
        <option>Non-Vegetarian</option>
        <option>Vegan</option>
      </select>

      <select name="exercise" value={formData.exercise} onChange={handleChange}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <input
        name="stress"
        type="number"
        min="1"
        max="10"
        value={formData.stress}
        onChange={handleChange}
        placeholder="Stress Level"
      />

      <div style={{ marginTop: "16px" }}>
        <button onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h2>Prediction Result</h2>
          <h3>Predicted Score: {result.predicted_score}</h3>
          <h3>Cognitive Level: {result.cognitive_level}</h3>

          {result.shap_explanation && (
            <>
              <p>
                <strong>Baseline Value:</strong>{" "}
                {result.shap_explanation.baseline_value}
              </p>

              <div style={{ marginTop: "20px" }}>
                <h3>Top Factors Increasing Score</h3>
                {result.shap_explanation.top_positive?.length > 0 ? (
                  <ul>
                    {result.shap_explanation.top_positive.map((item, index) => (
                      <li key={index}>
                        <strong>{item.label}</strong>: {item.value} (
                        <span style={{ color: "green" }}>
                          +{item.shap_value}
                        </span>
                        )
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No strong positive factors found.</p>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                <h3>Top Factors Decreasing Score</h3>
                {result.shap_explanation.top_negative?.length > 0 ? (
                  <ul>
                    {result.shap_explanation.top_negative.map((item, index) => (
                      <li key={index}>
                        <strong>{item.label}</strong>: {item.value} (
                        <span style={{ color: "red" }}>
                          {item.shap_value}
                        </span>
                        )
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No strong negative factors found.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}