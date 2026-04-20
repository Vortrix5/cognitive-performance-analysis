import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def build_llm_payload(predicted_score, cognitive_level, shap_explanation):
    return {
        "predicted_score": predicted_score,
        "cognitive_level": cognitive_level,
        "baseline_value": shap_explanation.get("baseline_value"),
        "top_positive": [
            {
                "label": item.get("label"),
                "value": item.get("value"),
                "shap_value": item.get("shap_value"),
            }
            for item in shap_explanation.get("top_positive", [])
        ],
        "top_negative": [
            {
                "label": item.get("label"),
                "value": item.get("value"),
                "shap_value": item.get("shap_value"),
            }
            for item in shap_explanation.get("top_negative", [])
        ],
    }


def build_prompt(payload):
    return f"""
You are an assistant inside a cognitive performance prediction app.

Your job is to explain a model result in simple, supportive, non-medical language.

Rules:
- Use only the provided data.
- Do not diagnose.
- Do not claim certainty.
- Be concise and clear.
- Return valid JSON only.
- Output keys must be:
  summary
  key_reasons
  suggestions
  disclaimer

Data:
{json.dumps(payload, indent=2)}

Return this JSON format:
{{
  "summary": "2 to 3 sentences",
  "key_reasons": ["reason 1", "reason 2", "reason 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "disclaimer": "one short sentence"
}}
""".strip()


def fallback_ai_insight(payload):
    top_positive = payload.get("top_positive", [])
    top_negative = payload.get("top_negative", [])

    best_positive = top_positive[0]["label"] if top_positive else None
    neg1 = top_negative[0]["label"] if len(top_negative) > 0 else None
    neg2 = top_negative[1]["label"] if len(top_negative) > 1 else None

    summary_parts = []

    if payload["cognitive_level"] == "Low":
        if neg1 and neg2 and best_positive:
            summary_parts.append(
                f"Your predicted result appears to be mainly reduced by {neg1} and {neg2}, while {best_positive} is your strongest supporting factor."
            )
        elif neg1 and best_positive:
            summary_parts.append(
                f"Your result appears to be lowered mostly by {neg1}, while {best_positive} helps support it."
            )
    elif payload["cognitive_level"] == "Medium":
        if neg1 and best_positive:
            summary_parts.append(
                f"Your profile looks mixed: {best_positive} supports the score, while {neg1} reduces it."
            )
    else:
        if best_positive:
            summary_parts.append(
                f"Your stronger result appears to be supported mainly by {best_positive}."
            )

    summary_parts.append(
        "This explanation is based on the model’s feature contributions for your specific prediction."
    )

    suggestions = []
    seen = set()
    for item in top_negative[:3]:
        label = item["label"]

        if "Stress" in label:
            s = "Work on lowering stress through sleep, breaks, or relaxation habits."
        elif "Reaction" in label:
            s = "Improve reaction-speed-related habits with rest, focus, and regular practice."
        elif "Caffeine" in label:
            s = "Keep caffeine intake moderate and avoid taking it too late in the day."
        elif "Exercise" in label:
            s = "Maintain a more regular exercise routine across the week."
        else:
            s = f"Try improving the factor related to {label}."

        if s not in seen:
            suggestions.append(s)
            seen.add(s)

    while len(suggestions) < 3:
        extra = "Track your habits over time and compare how they affect future results."
        if extra not in seen:
            suggestions.append(extra)
            seen.add(extra)
        else:
            break

    reasons = []
    for item in top_negative[:2]:
        reasons.append(f"{item['label']} is one of the strongest factors lowering your score.")
    for item in top_positive[:1]:
        reasons.append(f"{item['label']} is the strongest factor supporting your score.")

    while len(reasons) < 3:
        reasons.append("The explanation is based on the strongest SHAP contributors in your result.")

    return {
        "summary": " ".join(summary_parts),
        "key_reasons": reasons[:3],
        "suggestions": suggestions[:3],
        "disclaimer": "This is a model-based interpretation for general guidance, not a medical assessment.",
    }


def generate_ai_insight(predicted_score, cognitive_level, shap_explanation):
    payload = build_llm_payload(predicted_score, cognitive_level, shap_explanation)
    prompt = build_prompt(payload)

    try:
        response = client.responses.create(
            model="gpt-5.4",
            input=prompt
        )

        text = response.output_text
        return json.loads(text)

    except Exception as e:
        print("LLM API error:", e)
        return fallback_ai_insight(payload)