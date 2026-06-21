import pandas as pd
import numpy as np
import json
from typing import Any
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.services.data_service import data_service
from app.services.ai_service import AIService


class AnalyticsService:
    def __init__(self):
        self.ai_service = AIService()

    def analyze_dataset(self, data_source: str, analysis_type: str,
                        target_column: str | None = None,
                        parameters: dict | None = None) -> dict:
        df = data_service.get_dataset(data_source)
        if df is None:
            return {"error": f"Dataset '{data_source}' not found"}

        summary = data_service.get_summary(data_source)
        summary_text = data_service.get_context_for_llm(data_source)

        computed = self._run_analysis(df, analysis_type, target_column, parameters)

        ai_analysis = self.ai_service.analyze_data(summary_text, analysis_type)

        ai_viz_has_real_data = False
        for v in (ai_analysis.get("visualizations") or []):
            if not isinstance(v, dict):
                continue
            d = v.get("data") or {}
            t = v.get("type", "")
            if t == "heatmap" and isinstance(d.get("matrix"), list) and len(d["matrix"]) > 0:
                ai_viz_has_real_data = True
                break
            if t in ("line", "bar", "scatter", "histogram") and isinstance(d.get("values"), list) and len(d["values"]) > 0:
                ai_viz_has_real_data = True
                break
            if t in ("bar",) and isinstance(d.get("labels"), list) and len(d["labels"]) > 0:
                ai_viz_has_real_data = True
                break

        merged_insights = []
        seen = set()
        for item in (computed.get("insights") or []) + (ai_analysis.get("insights") or []):
            key = item.lower().strip() if isinstance(item, str) else str(item)
            if key not in seen:
                seen.add(key)
                merged_insights.append(item)

        merged_recs = []
        seen_r = set()
        for item in (computed.get("recommendations") or []) + (ai_analysis.get("recommendations") or []):
            key = item.lower().strip() if isinstance(item, str) else str(item)
            if key not in seen_r:
                seen_r.add(key)
                merged_recs.append(item)

        return {
            "title": ai_analysis.get("title") or computed.get("title") or f"{analysis_type.replace('_', ' ').title()} Analysis",
            "summary": ai_analysis.get("summary") or computed.get("summary") or "Analysis completed.",
            "visualizations": computed.get("visualizations", []) if not ai_viz_has_real_data
                              else ai_analysis.get("visualizations", computed.get("visualizations", [])),
            "insights": merged_insights,
            "recommendations": merged_recs,
        }

    def _run_analysis(self, df: pd.DataFrame, analysis_type: str,
                      target_column: str | None,
                      parameters: dict | None) -> dict:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

        result = {"visualizations": [], "insights": [], "recommendations": []}

        if analysis_type == "correlation":
            return self._correlation_analysis(df, numeric_cols)
        elif analysis_type == "trend":
            return self._trend_analysis(df, numeric_cols, target_column)
        elif analysis_type == "distribution":
            return self._distribution_analysis(df, numeric_cols, categorical_cols, target_column)
        elif analysis_type == "clustering":
            return self._clustering_analysis(df, numeric_cols)
        elif analysis_type == "outlier":
            return self._outlier_analysis(df, numeric_cols)
        elif analysis_type == "forecast":
            return self._forecast_analysis(df, target_column)
        else:
            return {
                "visualizations": [],
                "insights": [f"Analysis type '{analysis_type}' applied to {len(df)} records."],
                "recommendations": ["Try specific analysis types: correlation, trend, distribution, clustering, outlier"]
            }

    def _correlation_analysis(self, df: pd.DataFrame, numeric_cols: list) -> dict:
        if len(numeric_cols) < 2:
            return {"visualizations": [], "insights": ["Need at least 2 numeric columns for correlation analysis"],
                    "recommendations": ["Upload data with multiple numeric metrics"]}

        corr = df[numeric_cols].corr().round(2)
        strong_corrs = []
        for i in range(len(corr.columns)):
            for j in range(i + 1, len(corr.columns)):
                val = corr.iloc[i, j]
                if abs(val) > 0.5:
                    strong_corrs.append(f"{corr.columns[i]} ↔ {corr.columns[j]}: {val:+.2f}")

        corr_matrix = [[corr.iloc[i, j] for j in range(len(corr.columns))] for i in range(len(corr.columns))]

        insights = [f"Found {len(strong_corrs)} strong correlations"] if strong_corrs else ["No strong correlations found"]
        insights.extend(strong_corrs[:5])

        return {
            "visualizations": [{
                "type": "heatmap",
                "title": "Correlation Matrix",
                "data": {"matrix": corr_matrix, "columns": list(corr.columns)},
                "reason": "Shows relationships between numeric variables"
            }],
            "insights": insights,
            "recommendations": [
                "Focus on strongly correlated variables for deeper analysis",
                "Consider causal analysis for high-correlation pairs"
            ]
        }

    def _trend_analysis(self, df: pd.DataFrame, numeric_cols: list, target_column: str | None) -> dict:
        target = target_column if target_column and target_column in numeric_cols else (numeric_cols[0] if numeric_cols else None)
        if not target:
            return {"visualizations": [], "insights": ["No numeric column available for trend analysis"],
                    "recommendations": ["Upload data with numeric time-series metrics"]}

        vals = df[target].dropna()
        if len(vals) < 5:
            return {"visualizations": [], "insights": ["Insufficient data for trend analysis"],
                    "recommendations": ["Collect more data points over time"]}

        x = np.arange(len(vals)).reshape(-1, 1)
        y = vals.values
        model = LinearRegression()
        model.fit(x, y)
        trend_direction = "upward" if model.coef_[0] > 0 else "downward"
        slope = abs(model.coef_[0])

        return {
            "visualizations": [{
                "type": "line",
                "title": f"{target} Trend",
                "data": {"values": vals.tolist(), "index": list(range(len(vals)))},
                "reason": "Shows trend over time"
            }],
            "insights": [
                f"{target} shows {trend_direction} trend (slope: {slope:.3f} per unit)",
                f"Mean: {vals.mean():.2f}, Std: {vals.std():.2f}",
                f"Min: {vals.min():.2f}, Max: {vals.max():.2f}"
            ],
            "recommendations": [
                "Monitor this trend regularly for decision-making",
                "Investigate factors driving the trend"
            ]
        }

    def _distribution_analysis(self, df: pd.DataFrame, numeric_cols: list,
                                categorical_cols: list, target_column: str | None) -> dict:
        target = target_column if target_column and target_column in df.columns else (
            numeric_cols[0] if numeric_cols else None)

        visualizations = []
        insights = []
        recommendations = []

        if target and target in numeric_cols:
            vals = df[target].dropna()
            visualizations.append({
                "type": "histogram",
                "title": f"{target} Distribution",
                "data": {"values": vals.tolist(), "bins": 20},
                "reason": "Shows the distribution of values"
            })
            skew = vals.skew()
            insights.append(f"{target}: mean={vals.mean():.2f}, median={vals.median():.2f}, skew={skew:.2f}")

        if categorical_cols and target:
            for cat in categorical_cols[:2]:
                grouped = df.groupby(cat)[target].mean().sort_values(ascending=False)
                visualizations.append({
                    "type": "bar",
                    "title": f"Average {target} by {cat}",
                    "data": {"labels": grouped.index.tolist(), "values": grouped.values.tolist()},
                    "reason": f"Shows how {target} varies across {cat} categories"
                })
                insights.append(f"Top {cat}: {grouped.index[0]} ({grouped.values[0]:.2f}), "
                              f"Bottom: {grouped.index[-1]} ({grouped.values[-1]:.2f})")

        return {
            "visualizations": visualizations,
            "insights": insights or ["Distribution analysis completed."],
            "recommendations": recommendations or ["Explore segment-level differences for targeted interventions"]
        }

    def _clustering_analysis(self, df: pd.DataFrame, numeric_cols: list) -> dict:
        if len(numeric_cols) < 2:
            return {"visualizations": [], "insights": ["Need at least 2 numeric columns for clustering"],
                    "recommendations": ["Upload multi-dimensional data"]}

        data = df[numeric_cols].dropna()
        if len(data) < 10:
            return {"visualizations": [], "insights": ["Insufficient data for clustering"],
                    "recommendations": ["Collect more data points"]}

        scaler = StandardScaler()
        scaled = scaler.fit_transform(data)

        n_clusters = min(4, len(data) // 10)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(scaled)

        cluster_sizes = pd.Series(labels).value_counts().sort_index()

        df_result = df.loc[data.index].copy()
        df_result["cluster"] = labels

        centroids = scaler.inverse_transform(kmeans.cluster_centers_)

        return {
            "visualizations": [{
                "type": "scatter",
                "title": f"Cluster Analysis ({n_clusters} clusters)",
                "data": {
                    "x": data[numeric_cols[0]].tolist(),
                    "y": data[numeric_cols[1]].tolist(),
                    "labels": labels.tolist(),
                },
                "reason": "Shows natural groupings in the data"
            }],
            "insights": [
                f"Identified {n_clusters} distinct clusters in the data",
                f"Cluster sizes: {cluster_sizes.to_dict()}",
                f"Key separating dimensions: {numeric_cols[0]}, {numeric_cols[1]}"
            ],
            "recommendations": [
                "Target each cluster with tailored strategies",
                "Analyze cluster characteristics for actionable insights"
            ]
        }

    def _outlier_analysis(self, df: pd.DataFrame, numeric_cols: list) -> dict:
        outliers_found = {}
        for col in numeric_cols:
            vals = df[col].dropna()
            q1, q3 = vals.quantile(0.25), vals.quantile(0.75)
            iqr = q3 - q1
            lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
            outliers = vals[(vals < lower) | (vals > upper)]
            if len(outliers) > 0:
                outliers_found[col] = {"count": len(outliers), "pct": round(len(outliers) / len(vals) * 100, 1)}

        return {
            "visualizations": [{
                "type": "bar",
                "title": "Outlier Count by Column",
                "data": {
                    "labels": list(outliers_found.keys()),
                    "values": [v["count"] for v in outliers_found.values()]
                },
                "reason": "Identifies columns with anomalous values"
            }] if outliers_found else [],
            "insights": [
                f"Found {sum(v['count'] for v in outliers_found.values())} outliers across {len(outliers_found)} columns"
            ] if outliers_found else ["No significant outliers detected"],
            "recommendations": [
                "Investigate outliers for data quality issues",
                "Consider outlier treatment for model training"
            ] if outliers_found else []
        }

    def _forecast_analysis(self, df: pd.DataFrame, target_column: str | None) -> dict:
        target = target_column if target_column and target_column in df.select_dtypes(include=[np.number]).columns else (
            df.select_dtypes(include=[np.number]).columns[0] if len(df.select_dtypes(include=[np.number]).columns) > 0 else None
        )

        if not target:
            return {"visualizations": [], "insights": ["No numeric column available for forecasting"],
                    "recommendations": ["Upload time-series numeric data"]}

        vals = df[target].dropna()
        if len(vals) < 10:
            return {"visualizations": [], "insights": ["Need more data points for forecasting (min 10)"],
                    "recommendations": ["Collect time-series data over longer periods"]}

        n = len(vals)
        split = int(n * 0.8)
        train, test = vals[:split], vals[split:]

        x_train = np.arange(len(train)).reshape(-1, 1)
        y_train = train.values
        x_test = np.arange(len(train), len(train) + len(test)).reshape(-1, 1)
        y_test = test.values

        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(x_train, y_train)
        predictions = model.predict(x_test)

        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        r2 = r2_score(y_test, predictions)

        future_periods = 10
        x_future = np.arange(n, n + future_periods).reshape(-1, 1)
        forecast = model.predict(x_future)

        forecast_data = [{"period": int(i), "value": float(v)}
                        for i, v in zip(range(n, n + future_periods), forecast)]

        return {
            "visualizations": [
                {
                    "type": "line",
                    "title": f"{target}: Historical & Forecast",
                    "data": {
                        "historical": vals.tolist(),
                        "forecast": forecast.tolist(),
                        "split_point": split
                    },
                    "reason": "Shows historical data and predicted future values"
                },
                {
                    "type": "scatter",
                    "title": "Actual vs Predicted",
                    "data": {"x": y_test.tolist(), "y": predictions.tolist(), "labels": None},
                    "reason": "Evaluates forecast accuracy"
                }
            ],
            "insights": [
                f"Forecast model: R²={r2:.3f}, MAE={mae:.2f}, RMSE={rmse:.2f}",
                f"Predicted {target} trend over next {future_periods} periods",
                f"Current avg: {vals.mean():.2f}, Forecast avg: {forecast.mean():.2f}"
            ],
            "recommendations": [
                "Use forecast for resource planning and budgeting",
                "Update model as new data becomes available"
            ]
        }

    def generate_predictions(self, data_source: str, target_column: str,
                             periods: int = 12, frequency: str = "M") -> dict:
        df = data_service.get_dataset(data_source)
        if df is None:
            return {"error": f"Dataset '{data_source}' not found"}

        if target_column not in df.columns:
            return {"error": f"Column '{target_column}' not found"}

        vals = df[target_column].dropna()
        if len(vals) < 10:
            return {"error": "Need at least 10 data points for forecasting"}

        n = len(vals)
        split = int(n * 0.8)
        train, test = vals[:split], vals[split:]

        x_train = np.arange(len(train)).reshape(-1, 1)
        y_train = train.values
        x_test = np.arange(len(train), len(train) + len(test)).reshape(-1, 1)
        y_test = test.values

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(x_train, y_train)
        predictions = model.predict(x_test)

        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        r2 = r2_score(y_test, predictions)

        x_future = np.arange(n, n + periods).reshape(-1, 1)
        forecast = model.predict(x_future)
        residuals = y_test - predictions
        residual_std = np.std(residuals)

        forecast_data = [{"period": f"Period {i+1}", "value": float(v)}
                        for i, v in enumerate(forecast)]

        summary_insights = self.ai_service.predict_summary(forecast_data, target_column)

        return {
            "forecast": forecast_data,
            "confidence_upper": [float(v + 1.96 * residual_std) for v in forecast],
            "confidence_lower": [float(v - 1.96 * residual_std) for v in forecast],
            "metrics": {"mae": float(mae), "rmse": float(rmse), "r2": float(r2)},
            "insights": summary_insights,
        }


analytics_service = AnalyticsService()
