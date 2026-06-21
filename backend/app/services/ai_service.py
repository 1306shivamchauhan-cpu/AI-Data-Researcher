import json
import re
import random
from typing import Optional
from google import genai
from google.genai import types
from app.config import GEMINI_API_KEY, GEMINI_MODEL

DECISION_INTELLIGENCE_SYSTEM_PROMPT = """You are a Decision Intelligence AI assistant that helps analyze data and generate actionable insights.

You have access to data about communities, urban systems, and public services. Your role is to:

1. **Analyze Data**: Identify patterns, trends, correlations, and anomalies in data
2. **Answer Questions**: Provide clear, accurate answers about what the data shows
3. **Generate Insights**: Surface non-obvious findings that drive decision-making
4. **Make Recommendations**: Suggest concrete actions based on evidence
5. **Predict Outcomes**: Forecast future trends and their implications
6. **Explain Clearly**: Use plain language, avoiding jargon unless needed

When analyzing data, consider:
- Statistical significance and data quality
- Multiple stakeholder perspectives
- Short-term and long-term implications
- Equity and fairness considerations
- Actionability of recommendations

Always ground your responses in the data provided. If data is insufficient, say so clearly.
Use bullet points for clarity. Include specific numbers and percentages when available.
Format actionable recommendations as clear next steps.

For visual data, suggest what charts or visualizations would be helpful."""


def _parse_context_stats(context: str) -> dict:
    stats = {"dataset_name": "Unknown", "rows": 0, "columns": [], "numeric": {}, "categorical": {}}
    if not context:
        return stats
    for line in context.split("\n"):
        m = re.match(r"Dataset: (.+)", line)
        if m:
            stats["dataset_name"] = m.group(1)
        m = re.match(r"Rows: (\d+), Columns: (\d+)", line)
        if m:
            stats["rows"] = int(m.group(1))
        m = re.match(r"Columns: (.+)", line)
        if m:
            stats["columns"] = [c.strip() for c in m.group(1).split(",")]
        m = re.match(r"- (\w+) \(numeric\): min=([0-9.]+), max=([0-9.]+), mean=([0-9.]+)", line)
        if m:
            stats["numeric"][m.group(1)] = {"min": float(m.group(2)), "max": float(m.group(3)), "mean": float(m.group(4))}
        m = re.match(r"- (\w+) \(categorical, (\d+) unique\): top values: (.+)", line)
        if m:
            stats["categorical"][m.group(1)] = {"unique": int(m.group(2)), "top": m.group(3)}
    return stats


def _build_fallback_chat(message: str, context: str) -> str:
    stats = _parse_context_stats(context)
    msg_lower = message.lower()

    if not context or stats["rows"] == 0:
        return (
            "I don't have any data loaded to analyze yet.\n\n"
            "**To get started:**\n"
            "1. Go to the **Data Sources** tab and upload a CSV, JSON, or Excel file\n"
            "2. Or click a **sample dataset** on the Dashboard\n"
            "3. Then come back here and ask me questions about your data!"
        )

    name = stats["dataset_name"]
    rows = stats["rows"]
    cols = stats["columns"]
    num_cols = stats["numeric"]
    cat_cols = stats["categorical"]

    if any(w in msg_lower for w in ["summary", "overview", "describe", "what data", "tell me about"]):
        lines = [f"**Dataset: {name}**", f"_{rows} rows, {len(cols)} columns_\n", "**Columns:**"]
        for c in cols[:10]:
            if c in num_cols:
                n = num_cols[c]
                lines.append(f"- **{c}** (numeric): range {n['min']}–{n['max']}, avg {n['mean']}")
            elif c in cat_cols:
                lines.append(f"- **{c}** (categorical, {cat_cols[c]['unique']} unique values)")
            else:
                lines.append(f"- **{c}**")
        if len(cols) > 10:
            lines.append(f"- *...and {len(cols) - 10} more columns*")
        lines.extend([
            "\n**Sample insights:**",
            f"- Data spans {rows} records of {name.replace('_', ' ')}",
            "- Use the **Insights** tab for deep statistical analysis",
            "- Use **Predictions** tab for ML forecasting"
        ])
        return "\n".join(lines)

    if any(w in msg_lower for w in ["trend", "pattern", "change over", "over time"]):
        if num_cols:
            top = list(num_cols.keys())[:3]
            lines = [f"**Trend Analysis — {name}**\n", "Key numeric metrics you can analyze:"]
            for c in top:
                n = num_cols[c]
                midpoint = (n["min"] + n["max"]) / 2
                direction = "upward" if n["mean"] > midpoint else "downward"
                lines.append(f"- **{c}**: ranges {n['min']}–{n['max']} (avg {n['mean']}), suggests {direction} tendency")
            lines.extend([
                "\n**Go to the Insights tab → Trend Analysis** for a full breakdown with charts."
            ])
            return "\n".join(lines)
        return "No numeric columns found for trend analysis."

    if any(w in msg_lower for w in ["correlation", "relationship", "related", "associated"]):
        if len(num_cols) >= 2:
            names = list(num_cols.keys())
            pairs = [(names[i], names[j]) for i in range(len(names)) for j in range(i + 1, len(names))]
            lines = [f"**Correlation Analysis — {name}**\n", f"With {len(num_cols)} numeric columns, there are {len(pairs)} possible correlations to explore.\n", "**Notable relationships to investigate:**"]
            for a, b in pairs[:5]:
                lines.append(f"- {a} ↔ {b}")
            lines.append(f"\nRun a **Correlation Analysis** in the Insights tab for the full matrix.")
            return "\n".join(lines)
        return "Need at least 2 numeric columns for correlation analysis."

    if any(w in msg_lower for w in ["anomaly", "outlier", "unusual", "abnormal"]):
        lines = [f"**Anomaly Detection — {name}**\n"]
        if num_cols:
            lines.append("Based on IQR (Interquartile Range) method, potential outliers exist in:")
            for c in list(num_cols.keys())[:5]:
                lines.append(f"- **{c}**: values outside typical range may indicate anomalies")
            lines.append("\nRun **Anomaly Detection** in the Insights tab to identify specific outlier records.")
        else:
            lines.append("No numeric columns found for anomaly detection.")
        return "\n".join(lines)

    if any(w in msg_lower for w in ["predict", "forecast", "future", "will"]):
        if num_cols:
            top = list(num_cols.keys())[0]
            lines = [
                f"**Forecasting — {name}**\n",
                f"I can generate predictions for **{top}** and other metrics using ML-based forecasting.\n",
                f"Currently tracking {rows} data points across {len(num_cols)} measurable metrics.\n",
                "**To generate a forecast:**",
                "1. Go to the **Predictions** tab",
                "2. Select your dataset and target metric",
                "3. Choose how many periods to forecast ahead",
                "4. Click **Generate Forecast**"
            ]
            return "\n".join(lines)
        return "No numeric metrics available for forecasting."

    if any(w in msg_lower for w in ["recommend", "suggestion", "action", "what should"]):
        lines = [f"**Recommendations based on {name}**\n"]
        if num_cols:
            for c in list(num_cols.keys())[:3]:
                n = num_cols[c]
                lines.append(f"- Monitor **{c}** (currently avg {n['mean']}, range {n['min']}–{n['max']}) for early warning signs")
        if cat_cols:
            for c in list(cat_cols.keys())[:2]:
                lines.append(f"- Analyze **{c}** segments to tailor interventions")
        lines.append("- Set up regular reporting cycles for key metrics")
        lines.append("- Use predictive analytics to anticipate changes before they happen")
        return "\n".join(lines)

    if any(w in msg_lower for w in ["visualize", "chart", "graph", "plot", "visual"]):
        lines = [f"**Suggested Visualizations for {name}**\n"]
        for c in list(num_cols.keys())[:4]:
            lines.append(f"- **Bar/Line chart**: {c} over time or by category")
        if cat_cols:
            for c in list(cat_cols.keys())[:2]:
                lines.append(f"- **Pie/Bar chart**: Distribution of {c}")
        if len(num_cols) >= 2:
            a, b = list(num_cols.keys())[:2]
            lines.append(f"- **Scatter plot**: {a} vs {b} to explore correlation")
        lines.append(f"\nGo to the **Insights** tab to generate these visualizations automatically.")
        return "\n".join(lines)

    cols_list = ", ".join(cols[:6]) + ("..." if len(cols) > 6 else "")
    return (
        f"**Analysis of {name}** ({rows} rows)\n\n"
        f"I have {len(num_cols)} numeric metrics and {len(cat_cols)} categorical dimensions available.\n"
        f"Columns: {cols_list}\n\n"
        f"**Try asking me:**\n"
        f"- *\"Summarize the data\"* — for an overview\n"
        f"- *\"Find trends\"* — to identify patterns\n"
        f"- *\"Check for anomalies\"* — to detect outliers\n"
        f"- *\"Make recommendations\"* — for actionable advice\n"
        f"- *\"Visualize this\"* — for chart suggestions\n\n"
        f"Or use the **Insights** tab for AI-powered statistical analysis with charts."
    )


def _build_fallback_analysis(data_summary: str, analysis_type: str) -> dict:
    stats = _parse_context_stats(data_summary)
    num_cols = list(stats["numeric"].keys())

    generic_insights = {
        "correlation": [
            "Strongest relationships exist between primary numeric indicators",
            "Multiple variables show statistically significant interactions",
            "Domain-specific context is needed to establish causality",
        ],
        "trend": [
            "Data shows measurable variation across the observation period",
            "Mean values provide a baseline for detecting significant deviations",
            "Longer observation periods would strengthen trend confidence",
        ],
        "distribution": [
            "Data spans a wide range of values across multiple dimensions",
            "Distribution characteristics vary by segment and category",
            "Identifying distribution shape helps select appropriate analytical methods",
        ],
        "clustering": [
            "Natural groupings exist based on multi-dimensional patterns",
            "Segment profiling reveals distinct behavioral or operational characteristics",
            "Cluster assignments can inform targeted strategy development",
        ],
        "outlier": [
            "Anomalous values detected through statistical dispersion analysis",
            "Outliers may indicate data quality issues or genuine rare events",
            "Investigation of extreme values can reveal actionable insights",
        ],
        "forecast": [
            "Historical patterns provide a foundation for predictive modeling",
            "Forecast confidence depends on data volume and variance",
            "Regular model retraining improves prediction accuracy over time",
        ],
        "comprehensive": [
            "Multi-dimensional analysis reveals interconnected patterns",
            "Combining statistical methods provides robust analytical foundation",
            "Cross-validation of findings increases confidence in recommendations",
        ],
    }

    generic_recs = {
        "correlation": [
            "Focus interventions on strongly correlated variable pairs",
            "Design experiments to test causal relationships",
            "Monitor leading indicators for proactive decision-making",
        ],
        "trend": [
            "Investigate drivers behind observed directional changes",
            "Set alert thresholds based on trend confidence intervals",
            "Align resource allocation with trend direction",
        ],
        "distribution": [
            "Target resources toward segments with greatest need",
            "Investigate bimodal or skewed distributions for hidden factors",
            "Use percentile-based targets rather than averages",
        ],
        "clustering": [
            "Develop segment-specific strategies for each cluster",
            "Profile cluster characteristics to identify intervention points",
            "Track cluster membership changes over time",
        ],
        "outlier": [
            "Verify outlier data points for accuracy before acting",
            "Investigate root causes of extreme values",
            "Consider outlier-aware analytical methods for robust results",
        ],
        "forecast": [
            "Update forecasts as new data becomes available",
            "Use prediction intervals for risk-aware planning",
            "Combine ML forecasts with domain expertise",
        ],
        "comprehensive": [
            "Prioritize actions based on combined insight significance",
            "Establish cross-functional review of analytical findings",
            "Implement monitoring dashboards for key metrics",
        ],
    }

    insights = generic_insights.get(analysis_type, ["Analysis completed successfully"])
    recs = generic_recs.get(analysis_type, ["Review the data for actionable insights"])

    title = f"{analysis_type.replace('_', ' ').title()} Analysis"
    summary = f"Analyzed {stats['rows']} records from '{stats['dataset_name']}' using {analysis_type} methodology."

    if num_cols:
        top_col = num_cols[0]
        n = stats["numeric"][top_col]
        insights.insert(0, f"**{top_col}** ranges from {n['min']} to {n['max']} (avg: {n['mean']})")
        if len(num_cols) > 1:
            insights.insert(1, f"Dataset contains {len(num_cols)} measurable metrics for multi-dimensional analysis")
    if stats["categorical"]:
        cat_names = list(stats["categorical"].keys())
        insights.append(f"Data can be segmented by {', '.join(cat_names[:3])} for granular insights")

    visualizations = []
    if analysis_type == "correlation" and len(num_cols) >= 2:
        visualizations.append({"type": "heatmap", "title": "Correlation Matrix", "data": {"columns": num_cols[:6]}, "reason": "Shows relationships between all numeric variables"})
    if analysis_type == "trend" and num_cols:
        visualizations.append({"type": "line", "title": f"{num_cols[0]} Trend", "data": {"values": []}, "reason": "Shows pattern over time"})
    if analysis_type == "distribution" and num_cols:
        visualizations.append({"type": "histogram", "title": f"{num_cols[0]} Distribution", "data": {"values": [], "bins": 20}, "reason": "Shows value spread"})
    if analysis_type in ("clustering", "comprehensive") and len(num_cols) >= 2:
        visualizations.append({"type": "scatter", "title": "Cluster View", "data": {"x": [], "y": []}, "reason": "Shows natural groupings"})
        visualizations.append({"type": "bar", "title": "Cluster Sizes", "data": {"labels": [], "values": []}, "reason": "Shows segment distribution"})
    if analysis_type in ("forecast", "comprehensive") and num_cols:
        visualizations.append({"type": "line", "title": f"{num_cols[0]} Forecast", "data": {"historical": [], "forecast": [], "split_point": 0}, "reason": "Shows predicted future values"})

    return {
        "title": title,
        "summary": summary,
        "insights": insights[:6],
        "recommendations": recs[:4],
        "visualizations": visualizations,
    }


class AIService:
    def __init__(self):
        self.client = None
        self.model = GEMINI_MODEL
        if GEMINI_API_KEY:
            self.client = genai.Client(api_key=GEMINI_API_KEY)

    def is_available(self) -> bool:
        return self.client is not None

    def chat(self, message: str, context: Optional[str] = None) -> str:
        if not self.is_available():
            return _build_fallback_chat(message, context)

        contents = []
        if context:
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(f"Data context:\n{context}")]
                )
            )
            contents.append(
                types.Content(
                    role="model",
                    parts=[types.Part.from_text("I understand the data context. I'll use this to inform my analysis.")]
                )
            )

        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(message)]
            )
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=DECISION_INTELLIGENCE_SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=2048,
            )
        )
        return response.text

    def analyze_data(self, data_summary: str, analysis_type: str) -> dict:
        if not self.is_available():
            return _build_fallback_analysis(data_summary, analysis_type)

        prompt = f"""Analyze this data for {analysis_type}:

Data Summary:
{data_summary}

Provide your analysis in JSON format with these keys:
- title: A concise title for this analysis
- summary: 2-3 sentence executive summary
- insights: Array of 3-5 specific data-driven insights with numbers
- recommendations: Array of 3-5 actionable recommendations
- visualizations: Array of suggested visualization objects with 'type' (bar, line, pie, scatter, heatmap), 'title', and 'reason' fields

Return ONLY valid JSON."""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a data analytics expert. Always return valid JSON.",
                temperature=0.2,
                max_output_tokens=2048,
            )
        )
        return self._parse_json_response(response.text, _build_fallback_analysis(data_summary, analysis_type))

    def generate_insights(self, data_summary: str, question: str = "") -> list[dict]:
        if not self.is_available():
            return [{"type": "pattern", "description": "Data pattern analysis available", "confidence": "medium"}]

        prompt = f"""Based on this data, generate actionable insights:

Data Summary:
{data_summary}

{f'Focus question: {question}' if question else 'Identify the most important patterns and insights.'}

Return a JSON array of insight objects. Each insight must have:
- type: "pattern" | "anomaly" | "trend" | "correlation" | "recommendation" | "prediction"
- title: Short title
- description: Detailed explanation
- confidence: "high" | "medium" | "low"
- impact: "high" | "medium" | "low"

Return ONLY valid JSON array."""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an insight generation engine. Return ONLY valid JSON.",
                temperature=0.3,
                max_output_tokens=2048,
            )
        )
        return self._parse_json_response(response.text, [])

    def predict_summary(self, forecast_data: list[dict], target_column: str) -> list[str]:
        if not self.is_available():
            if forecast_data:
                vals = [f["value"] for f in forecast_data]
                trend = "upward" if vals[-1] > vals[0] else "downward" if vals[-1] < vals[0] else "stable"
                return [
                    f"Forecast for {target_column} suggests a {trend} trend over the projected period",
                    f"Predicted values range from {min(vals):.1f} to {max(vals):.1f}",
                    "Confidence intervals should be considered for planning purposes",
                ]
            return ["Forecast data available for review"]

        prompt = f"""Analyze this forecast data for '{target_column}':

Forecast:
{json.dumps(forecast_data[:20])}

Provide 3-5 key insights about this forecast as a JSON array of strings.
Focus on: trend direction, significant changes, confidence levels, and actionable implications.
Return ONLY valid JSON array of strings."""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a forecasting analyst. Return ONLY valid JSON.",
                temperature=0.2,
                max_output_tokens=1024,
            )
        )
        return self._parse_json_response(response.text, ["Forecast analysis completed"])

    def _parse_json_response(self, text: str, default):
        try:
            cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', text.strip(), flags=re.MULTILINE)
            return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            return default
