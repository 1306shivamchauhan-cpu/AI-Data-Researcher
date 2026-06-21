import pandas as pd
import json
import uuid
import os
from pathlib import Path
from typing import Any
from app.config import DATA_DIR


class DataService:
    def __init__(self):
        self._datasets: dict[str, pd.DataFrame] = {}
        self._load_existing()

    def _load_existing(self):
        for f in DATA_DIR.glob("*.csv"):
            try:
                df = pd.read_csv(f)
                name = f.stem
                self._datasets[name] = df
            except Exception:
                pass
        for f in DATA_DIR.glob("*.json"):
            try:
                df = pd.read_json(f)
                name = f.stem
                self._datasets[name] = df
            except Exception:
                pass

    def list_datasets(self) -> list[dict[str, Any]]:
        return [
            {"name": name, "rows": len(df), "columns": list(df.columns)}
            for name, df in self._datasets.items()
        ]

    def get_dataset(self, name: str) -> pd.DataFrame | None:
        return self._datasets.get(name)

    def upload_dataframe(self, df: pd.DataFrame, name: str | None = None) -> str:
        if name is None:
            name = f"dataset_{uuid.uuid4().hex[:8]}"

        self._datasets[name] = df.copy()

        csv_path = DATA_DIR / f"{name}.csv"
        df.to_csv(csv_path, index=False)

        return name

    def get_preview(self, name: str, n: int = 10) -> list[dict[str, Any]]:
        df = self.get_dataset(name)
        if df is None:
            return []
        return df.head(n).to_dict(orient="records")

    def get_summary(self, name: str) -> dict[str, Any]:
        df = self.get_dataset(name)
        if df is None:
            return {"error": "Dataset not found"}

        summary = {
            "rows": len(df),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "missing_values": {col: int(df[col].isna().sum()) for col in df.columns},
            "numeric_columns": [],
            "categorical_columns": [],
            "temporal_columns": [],
        }

        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                summary["numeric_columns"].append(col)
                desc = df[col].describe()
                summary[f"{col}_stats"] = {
                    "min": float(desc["min"]) if pd.notna(desc["min"]) else None,
                    "max": float(desc["max"]) if pd.notna(desc["max"]) else None,
                    "mean": float(desc["mean"]) if pd.notna(desc["mean"]) else None,
                    "median": float(df[col].median()) if pd.notna(df[col].median()) else None,
                    "std": float(desc["std"]) if pd.notna(desc["std"]) else None,
                }
            elif pd.api.types.is_object_dtype(df[col]) or pd.api.types.is_categorical_dtype(df[col]):
                summary["categorical_columns"].append(col)
                summary[f"{col}_top_values"] = df[col].value_counts().head(10).to_dict()
            try:
                pd.to_datetime(df[col])
                summary["temporal_columns"].append(col)
            except (ValueError, TypeError):
                pass

        return summary

    def get_context_for_llm(self, name: str, max_rows: int = 50) -> str:
        df = self.get_dataset(name)
        if df is None:
            return "No dataset available."

        lines = [f"Dataset: {name}", f"Rows: {len(df)}, Columns: {len(df.columns)}"]
        lines.append(f"Columns: {', '.join(df.columns)}")
        lines.append("")

        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                lines.append(f"- {col} (numeric): min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}")
            elif pd.api.types.is_object_dtype(df[col]):
                unique = df[col].nunique()
                top = df[col].value_counts().head(3).to_dict()
                lines.append(f"- {col} (categorical, {unique} unique): top values: {top}")

        lines.append("")
        lines.append("Sample data (first 10 rows):")
        lines.append(df.head(10).to_string())

        return "\n".join(lines)

    def generate_sample_data(self, domain: str) -> str:
        np = __import__("numpy")

        samples = {
            "urban_mobility": {
                "columns": ["timestamp", "zone", "vehicle_count", "avg_speed_kmh", "congestion_index",
                           "air_quality_index", "incident_count", "day_of_week", "hour"],
                "generator": lambda n: pd.DataFrame({
                    "timestamp": pd.date_range("2025-01-01", periods=n, freq="1h")[:n],
                    "zone": np.random.choice(["Downtown", "Residential-A", "Residential-B", "Industrial", "Commercial"],
                                            size=n),
                    "vehicle_count": np.random.poisson(200, n).astype(int),
                    "avg_speed_kmh": np.random.normal(45, 15, n).clip(5, 90).round(1),
                    "congestion_index": np.random.uniform(0.1, 1.0, n).round(2),
                    "air_quality_index": np.random.normal(60, 20, n).clip(0, 200).round(1),
                    "incident_count": np.random.poisson(2, n).astype(int),
                    "day_of_week": np.random.choice(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], size=n),
                    "hour": np.random.randint(0, 24, n),
                })
            },
            "community_wellness": {
                "columns": ["month", "program", "participants", "satisfaction_score", "health_outcome_index",
                           "engagement_hours", "referral_count", "demographic_group", "cost_per_participant"],
                "generator": lambda n: pd.DataFrame({
                    "month": pd.date_range("2024-01-01", periods=n, freq="ME")[:n],
                    "program": np.random.choice(
                        ["Fitness", "Nutrition", "Mental Health", "Senior Wellness", "Youth Development"], size=n),
                    "participants": np.random.poisson(150, n).astype(int),
                    "satisfaction_score": np.random.uniform(2.5, 5.0, n).round(2),
                    "health_outcome_index": np.random.normal(70, 15, n).clip(0, 100).round(1),
                    "engagement_hours": np.random.exponential(20, n).round(1),
                    "referral_count": np.random.poisson(30, n).astype(int),
                    "demographic_group": np.random.choice(["Youth", "Adult", "Senior", "Family", "Veteran"], size=n),
                    "cost_per_participant": np.random.uniform(50, 500, n).round(2),
                })
            },
            "environmental": {
                "columns": ["date", "location", "temperature_c", "humidity_pct", "air_quality_pm25",
                           "water_quality_index", "energy_consumption_kwh", "waste_kg", "recycling_pct", "co2_ppm"],
                "generator": lambda n: pd.DataFrame({
                    "date": pd.date_range("2025-01-01", periods=n, freq="D")[:n],
                    "location": np.random.choice(
                        ["North Station", "South Station", "East Station", "West Station", "Central Hub"], size=n),
                    "temperature_c": np.random.normal(22, 8, n).round(1),
                    "humidity_pct": np.random.uniform(30, 90, n).round(1),
                    "air_quality_pm25": np.random.normal(35, 15, n).clip(0, 200).round(1),
                    "water_quality_index": np.random.normal(75, 10, n).clip(0, 100).round(1),
                    "energy_consumption_kwh": np.random.normal(5000, 1000, n).round(0),
                    "waste_kg": np.random.normal(300, 100, n).clip(0).round(1),
                    "recycling_pct": np.random.uniform(15, 65, n).round(1),
                    "co2_ppm": np.random.normal(415, 10, n).round(1),
                })
            },
            "public_safety": {
                "columns": ["date", "district", "incident_type", "response_time_min", "severity",
                           "weather_condition", "time_of_day", "officers_dispatched", "resolution_status"],
                "generator": lambda n: pd.DataFrame({
                    "date": pd.date_range("2025-01-01", periods=n, freq="D")[:n],
                    "district": np.random.choice(["District-1", "District-2", "District-3", "District-4", "District-5"],
                                                size=n),
                    "incident_type": np.random.choice(
                        ["Traffic", "Fire", "Medical", "Security", "Natural Disaster"], size=n),
                    "response_time_min": np.random.exponential(8, n).round(1),
                    "severity": np.random.choice(["Low", "Medium", "High", "Critical"], size=n, p=[0.3, 0.4, 0.2, 0.1]),
                    "weather_condition": np.random.choice(["Clear", "Rain", "Snow", "Fog", "Storm"], size=n),
                    "time_of_day": np.random.choice(["Morning", "Afternoon", "Evening", "Night"], size=n),
                    "officers_dispatched": np.random.poisson(3, n).astype(int),
                    "resolution_status": np.random.choice(["Resolved", "In Progress", "Escalated", "Closed"],
                                                         size=n, p=[0.6, 0.2, 0.1, 0.1]),
                })
            },
            "education": {
                "columns": ["semester", "institution", "program", "enrollment", "graduation_rate",
                           "employment_rate", "student_satisfaction", "avg_test_score", "resource_allocation"],
                "generator": lambda n: pd.DataFrame({
                    "semester": pd.date_range("2023-09-01", periods=n, freq="6ME")[:n],
                    "institution": np.random.choice(
                        ["Central High", "North Academy", "South College", "East Institute", "West University"], size=n),
                    "program": np.random.choice(
                        ["STEM", "Arts", "Humanities", "Vocational", "Adult Education"], size=n),
                    "enrollment": np.random.poisson(500, n).astype(int),
                    "graduation_rate": np.random.uniform(60, 98, n).round(1),
                    "employment_rate": np.random.uniform(50, 95, n).round(1),
                    "student_satisfaction": np.random.uniform(2.0, 5.0, n).round(2),
                    "avg_test_score": np.random.normal(75, 12, n).clip(0, 100).round(1),
                    "resource_allocation": np.random.uniform(10000, 100000, n).round(2),
                })
            },
        }

        generator = samples.get(domain, samples["urban_mobility"])
        df = generator["generator"](500)
        name = f"sample_{domain}"

        self.upload_dataframe(df, name)
        return name


data_service = DataService()
