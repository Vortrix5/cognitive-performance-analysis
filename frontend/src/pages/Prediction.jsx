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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ||
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
      const res = await api.post("/predict", formData);
      setResult(res.data);
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Prediction</h1>

      <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" />
      <input name="reaction" type="number" value={formData.reaction} onChange={handleChange} placeholder="Reaction Time" />
      <input name="memory" type="number" value={formData.memory} onChange={handleChange} placeholder="Memory Score" />
      <input name="caffeine" type="number" value={formData.caffeine} onChange={handleChange} placeholder="Caffeine Intake" />

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

      <input name="stress" type="number" min="1" max="10" value={formData.stress} onChange={handleChange} placeholder="Stress Level" />

      <div style={{ marginTop: "16px" }}>
        <button onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Predicted Score: {result.predicted_score}</h3>
          <h3>Cognitive Level: {result.cognitive_level}</h3>
        </div>
      )}
    </div>
  );
}