import numpy as np
import shap

FRIENDLY_NAMES = {
    "Age": "Age",
    "Reaction_Time": "Reaction Time",
    "Memory_Test_Score": "Memory Test Score",
    "Caffeine_Intake": "Caffeine Intake",
    "Gender": "Gender",
    "Diet_Type": "Diet Type",
    "Exercise_Frequency": "Exercise Frequency",
    "Stress_Level": "Stress Level",
    "Stress_Exercise_Interaction": "Combined Effect of Stress and Exercise",
}


def create_explainer(model):
    return shap.TreeExplainer(model)


def explain_prediction(explainer, input_df, feature_names, top_n=3):
    shap_values = explainer.shap_values(input_df)
    row_shap = shap_values[0]

    expected_value = explainer.expected_value
    if isinstance(expected_value, np.ndarray):
        expected_value = float(expected_value[0])
    else:
        expected_value = float(expected_value)

    contributions = []
    for i, feature in enumerate(feature_names):
        shap_val = float(row_shap[i])
        raw_value = input_df.iloc[0][feature]

        contributions.append({
            "feature": feature,
            "label": FRIENDLY_NAMES.get(feature, feature.replace("_", " ")),
            "value": float(raw_value),
            "shap_value": round(shap_val, 3),
            "impact": (
                "increases score" if shap_val > 0
                else "decreases score" if shap_val < 0
                else "no clear impact"
            )
        })

    top_positive = sorted(
        [x for x in contributions if x["shap_value"] > 0],
        key=lambda x: x["shap_value"],
        reverse=True
    )[:top_n]

    top_negative = sorted(
        [x for x in contributions if x["shap_value"] < 0],
        key=lambda x: x["shap_value"]
    )[:top_n]

    return {
        "baseline_value": round(expected_value, 3),
        "top_positive": top_positive,
        "top_negative": top_negative,
        "all_features": contributions
    }