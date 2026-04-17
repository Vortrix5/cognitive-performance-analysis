import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import time

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import (
    mean_squared_error,
    r2_score,
    accuracy_score,
    confusion_matrix,
)

# -------------------------
# PAGE CONFIG
# -------------------------
st.set_page_config(page_title="Cognitive AI Dashboard", layout="wide")

# -------------------------
# IMPROVED (LIGHTER) DARK THEME
# -------------------------
st.markdown(
    """
<style>

/* Softer background (FIX CONTRAST ISSUE) */
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #111827, #1f2937);
    color: #e5e7eb;
}

/* Sidebar */
[data-testid="stSidebar"] {
    background: #0b1220;
}

/* KPI Cards */
.kpi-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    padding: 18px;
    border-radius: 14px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    text-align: center;
    color: #f3f4f6;
}

/* Text readability boost */
h1, h2, h3 {
    color: #f9fafb !important;
}

p, span, label {
    color: #d1d5db !important;
}

/* Buttons */
.stButton>button {
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    color: white;
    border-radius: 10px;
    border: none;
    padding: 0.4rem 1rem;
}

/* Plotly transparency fix */
.js-plotly-plot, .plotly, .plot-container {
    background: transparent !important;
}

</style>
""",
    unsafe_allow_html=True,
)


# -------------------------
# LOAD DATA
# -------------------------
@st.cache_data
def load_data(file):
    df = pd.read_csv(file)

    df = df.drop(["User_ID", "AI_Predicted_Score"], axis=1, errors="ignore")

    # Encoding
    df["Gender"] = df["Gender"].map({"Male": 0, "Female": 1, "Other": 2})
    df["Diet_Type"] = df["Diet_Type"].map(
        {"Vegetarian": 0, "Non-Vegetarian": 1, "Vegan": 2}
    )
    df["Exercise_Frequency"] = df["Exercise_Frequency"].map(
        {"Low": 0, "Medium": 1, "High": 2}
    )

    # IMPORTANT: ensure numeric stress
    df["Stress_Level"] = df["Stress_Level"].astype(int)

    df["Stress_Exercise_Interaction"] = df["Stress_Level"] * df["Exercise_Frequency"]

    df["Cognitive_Class"] = pd.qcut(df["Cognitive_Score"], q=3, labels=[0, 1, 2])

    return df


# -------------------------
# MODELS
# -------------------------
@st.cache_resource
def train_models(X, y, y_class):
    rf_reg = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_reg.fit(X, y)

    rf_clf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_clf.fit(X, y_class)

    return rf_reg, rf_clf


@st.cache_data
def run_kmeans(X, k):
    return KMeans(n_clusters=k, random_state=42).fit_predict(X)


# -------------------------
# LOAD DATA
# -------------------------
uploaded_file = st.sidebar.file_uploader("Upload CSV", type=["csv"])

if uploaded_file:
    df = load_data(uploaded_file)
else:
    df = load_data("human_cognitive_performance.csv")

# -------------------------
# FEATURES
# -------------------------
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

rf_reg, rf_clf = train_models(X, y, y_class)

# -------------------------
# SIDEBAR (FIXED NAVBAR)
# -------------------------
st.sidebar.markdown(
    """
<style>

/* FORCE ALL NAV BUTTONS SAME SIZE */
div.stButton > button {
    width: 100%;
    height: 42px;
    border-radius: 10px;
    text-align: left;
    padding-left: 12px;
    font-size: 15px;

    background: rgba(255,255,255,0.04);
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.08);

    transition: all 0.2s ease-in-out;
}

/* HOVER */
div.stButton > button:hover {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    transform: translateX(3px);
}

/* ACTIVE BUTTON */
.active-btn > button {
    background: rgba(255,255,255,0.14) !important;
    border: 1px solid rgba(255,255,255,0.25) !important;
    font-weight: 600;
}

</style>
""",
    unsafe_allow_html=True,
)

st.sidebar.markdown("## 🧠 Cognitive AI Dashboard")
st.sidebar.markdown("---")

# keep state
if "page" not in st.session_state:
    st.session_state.page = "🏠 Dashboard"


# helper function
def nav_button(label):
    is_active = st.session_state.page == label

    if is_active:
        st.sidebar.markdown('<div class="active-btn">', unsafe_allow_html=True)

    if st.sidebar.button(label, key=label):
        st.session_state.page = label

    if is_active:
        st.sidebar.markdown("</div>", unsafe_allow_html=True)


# NAV ITEMS
nav_button("🏠 Dashboard")
nav_button("📊 EDA")
nav_button("🤖 Modeling")
nav_button("🎯 Prediction")

page = st.session_state.page


# -------------------------
# DASHBOARD
# -------------------------
if page == "🏠 Dashboard":
    st.title("🧠 Cognitive Performance Dashboard")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(
            f"""<div class="kpi-card"><h3>Rows</h3><h2>{df.shape[0]}</h2></div>""",
            unsafe_allow_html=True,
        )

    with col2:
        st.markdown(
            f"""<div class="kpi-card"><h3>Avg Score</h3><h2>{round(df['Cognitive_Score'].mean(),2)}</h2></div>""",
            unsafe_allow_html=True,
        )

    with col3:
        st.markdown(
            f"""<div class="kpi-card"><h3>Max Score</h3><h2>{df['Cognitive_Score'].max()}</h2></div>""",
            unsafe_allow_html=True,
        )

    with col4:
        st.markdown(
            f"""<div class="kpi-card"><h3>Min Score</h3><h2>{df['Cognitive_Score'].min()}</h2></div>""",
            unsafe_allow_html=True,
        )

    st.markdown("---")

    # -------------------------
    # FIXED ANIMATION (SORTED)
    # -------------------------

    st.subheader("🎬 Cognitive Impact Analysis ")

    # SORT DATA FOR CLEAN ANIMATION FLOW
    df_sorted = df.sort_values("Stress_Level")

    fig = px.scatter(
        df_sorted,
        x="Memory_Test_Score",
        y="Cognitive_Score",
        color="Cognitive_Class",
        animation_frame="Stress_Level",
        category_orders={"Stress_Level": sorted(df["Stress_Level"].unique())},
        opacity=0.85,
    )

    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#e5e7eb"),
    )

    st.plotly_chart(fig, use_container_width=True)

# -------------------------
# EDA
# -------------------------
elif page == "📊 EDA":
    st.title("📊 Exploratory Data Analysis")
    # ⭐ NEW FEATURE: DATASET PREVIEW
    st.subheader("📋 Dataset Preview")

    with st.expander("Click to view dataset"):
        st.dataframe(df, use_container_width=True)

    st.markdown("---")

    feature = st.selectbox("Select Feature", df.columns)

    fig = px.histogram(df, x=feature)
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#e5e7eb"),
    )

    st.plotly_chart(fig, use_container_width=True)

    st.subheader("Correlation Heatmap")

    corr = df.corr()

    fig = go.Figure(
        data=go.Heatmap(
            z=corr.values, x=corr.columns, y=corr.columns, colorscale="Viridis"
        )
    )

    st.plotly_chart(fig, use_container_width=True)

# -------------------------
# MODELING
# -------------------------
elif page == "🤖 Modeling":
    st.title("🤖 ML Models & Clustering")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    rf = RandomForestRegressor()
    rf.fit(X_train, y_train)

    preds = rf.predict(X_test)

    col1, col2 = st.columns(2)
    col1.metric("R2 Score", round(r2_score(y_test, preds), 3))
    col2.metric("RMSE", round(np.sqrt(mean_squared_error(y_test, preds)), 3))

    st.markdown("---")

    st.subheader("Feature Importance")

    importance = pd.Series(rf.feature_importances_, index=features)

    fig = px.bar(importance.sort_values(), orientation="h")
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")

    st.subheader("Classification Accuracy")

    preds_c = rf_clf.predict(X)
    acc = accuracy_score(y_class, preds_c)

    st.metric("Accuracy", round(acc, 3))

    cm = confusion_matrix(y_class, preds_c)

    fig = px.imshow(cm, text_auto=True, color_continuous_scale="Blues")
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")

    st.subheader("K-Means Clustering")

    k = st.slider("Select K", 2, 10, 3)

    clusters = run_kmeans(X, k)

    df_k = df.copy()
    df_k["Cluster"] = clusters

    fig = px.scatter(
        df_k, x="Memory_Test_Score", y="Cognitive_Score", color="Cluster", opacity=0.85
    )
    st.plotly_chart(fig, use_container_width=True)

# -------------------------
# PREDICTION
# -------------------------
elif page == "🎯 Prediction":
    st.title("🎯 Cognitive Score Prediction")

    col1, col2 = st.columns(2)

    with col1:
        age = st.number_input("Age", 10, 100, 25)
        reaction = st.number_input("Reaction Time", 100, 500, 250)
        memory = st.number_input("Memory Score", 0, 100, 50)
        caffeine = st.number_input("Caffeine Intake", 0, 500, 100)

    with col2:
        gender = st.selectbox("Gender", ["Male", "Female", "Other"])
        diet = st.selectbox("Diet", ["Vegetarian", "Non-Vegetarian", "Vegan"])
        exercise = st.selectbox("Exercise", ["Low", "Medium", "High"])
        stress = st.slider("Stress Level", 1, 10, 5)

    maps = {
        "Gender": {"Male": 0, "Female": 1, "Other": 2},
        "Diet": {"Vegetarian": 0, "Non-Vegetarian": 1, "Vegan": 2},
        "Exercise": {"Low": 0, "Medium": 1, "High": 2},
    }

    interaction = stress * maps["Exercise"][exercise]

    input_data = np.array(
        [
            [
                age,
                reaction,
                memory,
                caffeine,
                maps["Gender"][gender],
                maps["Diet"][diet],
                maps["Exercise"][exercise],
                stress,
                interaction,
            ]
        ]
    )

    if st.button("Predict"):
        with st.spinner("Analyzing cognitive patterns..."):
            time.sleep(0.5)

        score = rf_reg.predict(input_data)[0]
        level = rf_clf.predict(input_data)[0]

        labels = {0: "Low", 1: "Medium", 2: "High"}

        st.success(f"Predicted Score: {score:.2f}")
        st.info(f"Cognitive Level: {labels[level]}")
