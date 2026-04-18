from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score

app = Flask(__name__)
CORS(app)

# -------------------------
# LOAD DATA
# -------------------------
def load_data():
    df = pd.read_csv("human_cognitive_performance.csv")

    df = df.drop(["User_ID", "AI_Predicted_Score"], axis=1, errors="ignore")

    df["Gender"] = df["Gender"].map({"Male": 0, "Female": 1, "Other": 2})
    df["Diet_Type"] = df["Diet_Type"].map(
        {"Vegetarian": 0, "Non-Vegetarian": 1, "Vegan": 2}
    )
    df["Exercise_Frequency"] = df["Exercise_Frequency"].map(
        {"Low": 0, "Medium": 1, "High": 2}
    )

    df["Stress_Level"] = df["Stress_Level"].astype(int)
    df["Stress_Exercise_Interaction"] = df["Stress_Level"] * df["Exercise_Frequency"]
    df["Cognitive_Class"] = pd.qcut(df["Cognitive_Score"], q=3, labels=[0, 1, 2])

    return df

df = load_data()

features = [
    "Age",
    "Reaction_Time",
    "Memory_Test_Score",
    "Caffeine_Intake",
    "Gender",
    "Diet_Type",
    "Exercise_Frequency",
    "Stress_Level",
    "Stress_Exercise_Interaction",
]

X = df[features]
y = df["Cognitive_Score"]
y_class = df["Cognitive_Class"]

rf_reg = RandomForestRegressor(n_estimators=100, random_state=42)
rf_reg.fit(X, y)

rf_clf = RandomForestClassifier(n_estimators=100, random_state=42)
rf_clf.fit(X, y_class)

# -------------------------
# ROUTES
# -------------------------
@app.route("/")
def home():
    return jsonify({"message": "Backend is running"})

@app.route("/summary")
def summary():
    return jsonify({
        "rows": int(df.shape[0]),
        "avg_score": round(float(df["Cognitive_Score"].mean()), 2),
        "max_score": float(df["Cognitive_Score"].max()),
        "min_score": float(df["Cognitive_Score"].min()),
    })

@app.route("/data")
def data():
    return jsonify(df.head(50).to_dict(orient="records"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    gender_map = {"Male": 0, "Female": 1, "Other": 2}
    diet_map = {"Vegetarian": 0, "Non-Vegetarian": 1, "Vegan": 2}
    exercise_map = {"Low": 0, "Medium": 1, "High": 2}

    exercise_value = exercise_map[data["exercise"]]
    stress = int(data["stress"])
    interaction = stress * exercise_value

    input_data = np.array([[
        data["age"],
        data["reaction"],
        data["memory"],
        data["caffeine"],
        gender_map[data["gender"]],
        diet_map[data["diet"]],
        exercise_value,
        stress,
        interaction
    ]])

    score = float(rf_reg.predict(input_data)[0])
    level = int(rf_clf.predict(input_data)[0])

    labels = {0: "Low", 1: "Medium", 2: "High"}

    return jsonify({
        "predicted_score": round(score, 2),
        "cognitive_level": labels[level]
    })

@app.route("/clusters/<int:k>")
def clusters(k):
    model = KMeans(n_clusters=k, random_state=42)
    clusters = model.fit_predict(X)

    df_k = df.copy()
    df_k["Cluster"] = clusters

    return jsonify(df_k[["Memory_Test_Score", "Cognitive_Score", "Cluster"]].to_dict(orient="records"))

@app.route("/feature-importance")
def feature_importance():
    rf = RandomForestRegressor(random_state=42)
    rf.fit(X, y)

    importance = [
        {"feature": feature, "importance": float(value)}
        for feature, value in zip(features, rf.feature_importances_)
    ]

    importance = sorted(importance, key=lambda x: x["importance"], reverse=True)
    return jsonify(importance)

@app.route("/model-metrics")
def model_metrics():
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    rf = RandomForestRegressor(random_state=42)
    rf.fit(X_train, y_train)

    preds = rf.predict(X_test)

    preds_c = rf_clf.predict(X)
    acc = accuracy_score(y_class, preds_c)

    return jsonify({
        "r2_score": round(float(r2_score(y_test, preds)), 3),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, preds))), 3),
        "accuracy": round(float(acc), 3),
    })

if __name__ == "__main__":
    app.run(debug=True)