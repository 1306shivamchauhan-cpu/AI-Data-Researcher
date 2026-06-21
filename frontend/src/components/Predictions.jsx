import { useState, useEffect } from 'react'
import {
  TrendingUp, Loader2, Calendar, Target, AlertTriangle,
  ArrowUp, ArrowDown, Minus,
} from 'lucide-react'
import { api } from '../utils/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Legend,
} from 'recharts'

export default function Predictions() {
  const [datasets, setDatasets] = useState([])
  const [selectedDs, setSelectedDs] = useState(null)
  const [columns, setColumns] = useState([])
  const [targetColumn, setTargetColumn] = useState(null)
  const [periods, setPeriods] = useState(12)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.getDatasets().then(setDatasets).catch(() => {})
  }, [])

  const handleSelectDataset = async (name) => {
    setSelectedDs(name)
    setResult(null)
    try {
      const s = await api.getSummary(name)
      setSummary(s)
      setColumns(s.numeric_columns || [])
      setTargetColumn(s.numeric_columns?.[0] || null)
    } catch (e) {
      console.error(e)
    }
  }

  const handlePredict = async () => {
    if (!selectedDs || !targetColumn) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await api.predict(selectedDs, targetColumn, periods)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const chartData = result?.forecast?.map((f, i) => ({
    period: f.period,
    value: f.value,
    upper: result.confidence_upper?.[i] || f.value,
    lower: result.confidence_lower?.[i] || f.value,
  })) || []

  const trendIcon = result?.forecast?.length > 1
    ? (result.forecast[result.forecast.length - 1].value > result.forecast[0].value ? 'up' : 'down')
    : 'neutral'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold gradient-text font-heading">Predictive Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">ML-based forecasting to predict future trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="text-sm font-medium mb-3 font-heading">Dataset</h3>
            <select
              value={selectedDs || ''}
              onChange={(e) => handleSelectDataset(e.target.value)}
              className="input text-xs"
            >
              <option value="">Select a dataset</option>
              {datasets.map((ds) => (
                <option key={ds.name} value={ds.name}>{ds.name} ({ds.rows} rows)</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium mb-3 font-heading">Target Metric</h3>
            <select
              value={targetColumn || ''}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="input text-xs"
            >
              <option value="">Select column</option>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium mb-3 font-heading">Forecast Periods</h3>
            <input
              type="number"
              min={1}
              max={100}
              value={periods}
              onChange={(e) => setPeriods(Math.max(1, Math.min(100, parseInt(e.target.value) || 12)))}
              className="input text-xs"
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={!selectedDs || !targetColumn || loading}
            className="btn-primary w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
            {loading ? 'Predicting...' : 'Generate Forecast'}
          </button>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {error && (
            <div className="card border-red-800 bg-red-900/10">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="card text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-sm font-medium text-gray-400 font-heading">Configure your forecast</h3>
              <p className="text-xs text-gray-600 mt-2">Select a dataset, target metric, and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="card text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-400 mb-3" />
              <p className="text-sm text-gray-400">Running ML forecast model...</p>
            </div>
          )}

          {result && !loading && (
            <>
              {result.metrics && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="card-hover text-center">
                    <p className="text-xs text-gray-500 mb-1">R² Score</p>
                    <p className="text-xl font-semibold text-brand-400 font-data">
                      {result.metrics.r2 ? result.metrics.r2.toFixed(3) : '—'}
                    </p>
                    <p className="text-[10px] text-gray-600">Model accuracy</p>
                  </div>
                  <div className="card-hover text-center">
                    <p className="text-xs text-gray-500 mb-1">MAE</p>
                    <p className="text-xl font-semibold text-green-400 font-data">
                      {result.metrics.mae ? result.metrics.mae.toFixed(2) : '—'}
                    </p>
                    <p className="text-[10px] text-gray-600">Mean absolute error</p>
                  </div>
                  <div className="card-hover text-center">
                    <p className="text-xs text-gray-500 mb-1">Trend</p>
                    <p className="text-xl font-semibold flex items-center justify-center gap-1">
                      {trendIcon === 'up' ? (
                        <><ArrowUp className="w-5 h-5 text-green-400" /> Up</>
                      ) : trendIcon === 'down' ? (
                        <><ArrowDown className="w-5 h-5 text-red-400" /> Down</>
                      ) : (
                        <><Minus className="w-5 h-5 text-yellow-400" /> Stable</>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-600">Forecast direction</p>
                  </div>
                </div>
              )}

              {chartData.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium mb-4 font-heading">
                    Forecast: {targetColumn}
                    <span className="text-xs text-gray-500 ml-2">({periods} periods ahead)</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                        labelStyle={{ color: '#e5e7eb' }}
                      />
                      <defs>
                        <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="upper" fill="url(#confidenceGradient)" stroke="none" />
                      <Area type="monotone" dataKey="lower" fill="url(#confidenceGradient)" stroke="none" />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} name="Forecast" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.insights?.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-medium font-heading">Forecast Insights</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span className="text-gray-300">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {chartData.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-brand-400" />
                      <h3 className="text-sm font-medium font-heading">Forecast Values</h3>
                    </div>
                    <div className="overflow-y-auto max-h-64 scrollbar-thin">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400 font-medium">Period</th>
                            <th className="text-right py-2 text-gray-400 font-medium">Value</th>
                            <th className="text-right py-2 text-gray-400 font-medium">Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.map((d, i) => (
                            <tr key={i} className="border-b border-gray-800/50 last:border-0">
                              <td className="py-2 text-gray-300">{d.period}</td>
                              <td className="py-2 text-right text-gray-200 font-medium font-data">{d.value.toFixed(2)}</td>
                              <td className="py-2 text-right text-gray-500 font-data">
                                ±{(d.upper - d.lower) / 2 > 0 ? ((d.upper - d.lower) / 2).toFixed(2) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
