import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  BarChart3, Loader2, Lightbulb, Target, TrendingUp,
  Layers, Share2, CheckCircle2, AlertCircle, Play,
  ChevronLeft, ChevronRight, Sparkles, Database, Zap, Pause,
  Gauge, Activity, Crosshair,
} from 'lucide-react'
import { api } from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter } from 'recharts'

const analysisTypes = [
  { id: 'correlation', label: 'Correlation', icon: Share2, desc: 'Relationships between variables', color: '#6366f1', gradient: 'from-indigo-500 to-purple-600' },
  { id: 'trend', label: 'Trends', icon: TrendingUp, desc: 'Upward/downward patterns', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'distribution', label: 'Distribution', icon: Gauge, desc: 'Value spread', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  { id: 'clustering', label: 'Clusters', icon: Layers, desc: 'Natural groupings', color: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
  { id: 'outlier', label: 'Anomalies', icon: Activity, desc: 'Unusual points', color: '#ef4444', gradient: 'from-red-500 to-rose-600' },
  { id: 'forecast', label: 'Forecast', icon: Crosshair, desc: 'Future predictions', color: '#8b5cf6', gradient: 'from-violet-500 to-indigo-600' },
  { id: 'comprehensive', label: 'Comprehensive', icon: Sparkles, desc: 'Full multi-dimensional', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-600' },
]

function SparkleParticles({ count = 20 }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 2
        const size = 4 + Math.random() * 8
        const color = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 6)]
        return (
          <div
            key={i}
            className="absolute animate-sparkle-up"
            style={{
              left: `${left}%`,
              bottom: '-10px',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: '50%',
              animationDelay: `${delay}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
          />
        )
      })}
    </div>
  )
}

function AnimatedCard({ children, className = '', delay = 0 }) {
  return (
    <div
      className={`animate-fade-slide-up ${className}`}
      style={{
        animationDelay: `${delay}s`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  )
}

function TypeBadge({ type, active, onClick, done, error, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
        active
          ? 'shadow-lg shadow-black/20'
          : done
            ? 'hover:translate-x-0.5'
            : error
              ? ''
              : 'opacity-40'
      }`}
      style={{
        background: active
          ? `linear-gradient(135deg, ${type.color}20, ${type.color}08)`
          : done
            ? 'rgba(255,255,255,0.03)'
            : 'transparent',
        borderColor: active ? type.color : done ? `${type.color}30` : 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
          active ? 'scale-110' : 'group-hover:scale-105'
        }`}
        style={{ backgroundColor: `${type.color}20` }}
      >
        <type.icon className="w-3.5 h-3.5" style={{ color: type.color }} />
      </div>
      <span className="flex-1 text-left" style={{ color: active ? '#e5e7eb' : done ? '#9ca3af' : error ? '#ef4444' : '#4b5563' }}>
        {type.label}
      </span>
      <div className="flex items-center gap-1.5">
        {done && <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: type.color }} />}
        {error && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
        {active && (
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: type.color }} />
        )}
      </div>
      {done && !active && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
    </button>
  )
}

function StageIndicator({ completed, total }) {
  const stages = [
    { range: [0, 0], label: 'Connecting', icon: Database },
    { range: [1, 3], label: 'Analyzing', icon: Activity },
    { range: [4, 5], label: 'Computing', icon: Zap },
    { range: [6, 6], label: 'Finalizing', icon: Sparkles },
    { range: [7, 7], label: 'Complete!', icon: CheckCircle2 },
  ]
  const stage = stages.find(s => completed >= s.range[0] && completed <= s.range[1]) || stages[stages.length - 1]
  const progress = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        {React.createElement(stage.icon, { className: 'w-4 h-4', style: { color: '#6366f1' } })}
        <span className="text-sm font-medium text-gray-300">{stage.label}</span>
        <span className="text-xs text-gray-500 ml-1 font-data">{completed}/{total}</span>
      </div>
      <div className="relative h-2 bg-gray-800/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}
        />
        <div
          className="absolute top-0 left-0 h-full w-8 rounded-full animate-progress-glide"
          style={{
            background: 'rgba(255,255,255,0.15)',
            filter: 'blur(4px)',
          }}
        />
      </div>
    </div>
  )
}

const infoSnippets = [
  'Looking for correlations between columns...',
  'Identifying upward and downward trends...',
  'Mapping value distributions across segments...',
  'Finding natural data clusters...',
  'Detecting statistical anomalies...',
  'Building forecast models...',
  'Running comprehensive multi-dimensional analysis...',
  'Optimizing clustering parameters...',
  'Computing confidence intervals...',
]

export default function Insights() {
  const [datasets, setDatasets] = useState([])
  const [selectedDs, setSelectedDs] = useState(null)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({ completed: 0, total: 7 })
  const [showCelebration, setShowCelebration] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [snippetIdx, setSnippetIdx] = useState(0)
  const [showSummary, setShowSummary] = useState(true)
  const autoRef = useRef(null)

  useEffect(() => {
    api.getDatasets().then(setDatasets).catch(() => {})
  }, [])

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => setSnippetIdx(i => (i + 1) % infoSnippets.length), 3000)
      return () => clearInterval(interval)
    }
  }, [loading])

  useEffect(() => {
    if (results && autoRotate && activeTab) {
      const doneTypes = analysisTypes.filter(at => results[at.id]?.status === 'done')
      if (doneTypes.length <= 1) return
      autoRef.current = setInterval(() => {
        setActiveTab(prev => {
          const idx = analysisTypes.findIndex(at => at.id === prev)
          const doneIds = analysisTypes.filter(at => results[at.id]?.status === 'done').map(at => at.id)
          let nextIdx = (idx + 1) % analysisTypes.length
          for (let i = 0; i < analysisTypes.length; i++) {
            if (doneIds.includes(analysisTypes[nextIdx].id)) break
            nextIdx = (nextIdx + 1) % analysisTypes.length
          }
          return analysisTypes[nextIdx].id
        })
      }, 5000)
      return () => clearInterval(autoRef.current)
    }
  }, [results, autoRotate, activeTab])

  const handleRunAll = useCallback(async () => {
    if (!selectedDs) return
    setLoading(true)
    setError(null)
    setResults(null)
    setActiveTab(null)
    setShowCelebration(false)
    setShowSummary(true)

    const resultMap = {}

    const promises = analysisTypes.map(async (at) => {
      try {
        const res = await api.analyze(selectedDs, at.id, null)
        resultMap[at.id] = { ...res, status: 'done' }
      } catch (e) {
        resultMap[at.id] = { status: 'error', error: e.message, title: at.label }
      } finally {
        const done = Object.values(resultMap).length
        setProgress({ completed: done, total: analysisTypes.length })
      }
    })

    await Promise.all(promises)

    setResults(resultMap)
    setActiveTab('correlation')
    setLoading(false)
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 5000)
  }, [selectedDs])

  const currentResult = activeTab ? results?.[activeTab] : null
  const currentType = analysisTypes.find(at => at.id === activeTab)

  const navigateTab = (dir) => {
    setAutoRotate(false)
    const doneTypes = analysisTypes.filter(at => results?.[at.id]?.status === 'done')
    if (doneTypes.length <= 1) return
    const idx = doneTypes.findIndex(at => at.id === activeTab)
    const next = (idx + dir + doneTypes.length) % doneTypes.length
    setActiveTab(doneTypes[next].id)
  }

  const allDone = results && analysisTypes.every(at => results[at.id]?.status === 'done')
  const successCount = results ? Object.values(results).filter(r => r.status === 'done').length : 0
  const errorCount = results ? Object.values(results).filter(r => r.status === 'error').length : 0

  const renderViz = (viz, idx) => {
    if (!viz?.data) return null
    const data = viz.data
    const accent = currentType?.color || '#6366f1'

    const chartContent = (() => {
      switch (viz.type) {
        case 'bar':
          if (!data.labels || !data.values) return null
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.labels.map((l, i) => ({ name: l, value: data.values[i] }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: `1px solid ${accent}30`, borderRadius: '12px', boxShadow: `0 8px 32px ${accent}20` }} labelStyle={{ color: '#e5e7eb' }} />
                <Bar dataKey="value" fill={accent} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )
        case 'line':
          if (!data.values) return null
          const chartData = data.values.map((v, i) => ({ index: i, value: v }))
          const split = data.split_point
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.5} />
                <XAxis dataKey="index" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: `1px solid ${accent}30`, borderRadius: '12px', boxShadow: `0 8px 32px ${accent}20` }} labelStyle={{ color: '#e5e7eb' }} />
                {split !== undefined ? (
                  <>
                    <Line data={chartData.slice(0, split)} type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} dot={false} name="Historical" />
                    <Line data={chartData.slice(split)} type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 4" dot={false} name="Forecast" />
                  </>
                ) : (
                  <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )
        case 'scatter':
          if (!data.x || !data.y) return null
          return (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.5} />
                <XAxis dataKey="x" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="y" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: `1px solid ${accent}30`, borderRadius: '12px', boxShadow: `0 8px 32px ${accent}20` }} labelStyle={{ color: '#e5e7eb' }} />
                <Scatter data={data.x.map((x, i) => ({ x, y: data.y[i] }))} fill={accent} opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          )
        case 'histogram':
          if (!data.values) return null
          const min = Math.min(...data.values)
          const max = Math.max(...data.values)
          const bins = data.bins || 20
          const binW = (max - min) / bins
          const hist = Array.from({ length: bins }, (_, i) => ({
            bin: `${(min + i * binW).toFixed(1)}`,
            count: data.values.filter(v => v >= min + i * binW && v < min + (i + 1) * binW).length,
          }))
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.5} />
                <XAxis dataKey="bin" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: `1px solid ${accent}30`, borderRadius: '12px', boxShadow: `0 8px 32px ${accent}20` }} labelStyle={{ color: '#e5e7eb' }} />
                <Bar dataKey="count" fill={accent} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        case 'heatmap':
          if (!data.matrix || !data.columns) return null
          const cols = data.columns
          return (
            <div className="overflow-x-auto">
              <table className="text-xs mx-auto border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th />
                    {cols.map(c => <th key={c} className="px-2 py-1 text-gray-400 font-medium text-[10px]">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 text-gray-400 font-medium text-[10px]">{cols[i]}</td>
                      {row.map((val, j) => {
                        const abs = Math.abs(val)
                        return (
                          <td key={j} className="px-2.5 py-1.5 text-center rounded-lg transition-transform hover:scale-110"
                            style={{
                              backgroundColor: val >= 0
                                ? `rgba(99,102,241,${abs * 0.8})`
                                : `rgba(239,68,68,${abs * 0.6})`,
                              color: abs > 0.4 ? '#fff' : '#9ca3af',
                            }}
                          >{val.toFixed(2)}</td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        default:
          return null
      }
    })()

    if (!chartContent) return null

    return (
      <AnimatedCard key={idx} delay={idx * 0.1}>
        <div className="card group hover:border-white/10 transition-all duration-500" style={{ borderColor: `${accent}15` }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-200">{viz.title}</h4>
              {viz.reason && <p className="text-[11px] text-gray-500 mt-0.5">{viz.reason}</p>}
            </div>
          </div>
          {chartContent}
        </div>
      </AnimatedCard>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {showCelebration && <SparkleParticles count={30} />}

      {/* Header */}
      <AnimatedCard delay={0}>
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-60" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent font-heading">
                  Insights & Analysis
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Run a full analysis suite and browse results by category</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Summary Dashboard */}
      {results && showSummary && (
        <AnimatedCard delay={0.1}>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-transparent to-purple-600/5" />
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-gray-200 font-heading">Analysis Dashboard</h3>
                </div>
                <button onClick={() => setShowSummary(false)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Dismiss</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {analysisTypes.map(at => {
                  const r = results[at.id]
                  const count = r?.status === 'done' ? (r.insights?.length || 0) + (r.recommendations?.length || 0) : 0
                  return (
                    <button
                      key={at.id}
                      onClick={() => { setActiveTab(at.id); setShowSummary(false) }}
                      disabled={r?.status !== 'done'}
                      className={`relative group text-left p-3 rounded-xl transition-all duration-300 ${
                        r?.status === 'done'
                          ? 'hover:scale-[1.02] cursor-pointer border border-white/[0.06] hover:border-white/20'
                          : r?.status === 'error'
                            ? 'border border-red-900/30 opacity-60'
                            : 'border border-transparent opacity-40'
                      }`}
                      style={{ background: r?.status === 'done' ? `${at.color}08` : 'transparent' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${at.color}20` }}>
                          <at.icon className="w-3 h-3" style={{ color: at.color }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: at.color }}>{at.label}</span>
                      </div>
                      {r?.status === 'done' ? (
                        <p className="text-[10px] text-gray-500 font-data">{count > 0 ? `${count} findings` : 'Complete'}</p>
                      ) : r?.status === 'error' ? (
                        <p className="text-[10px] text-red-400">Failed</p>
                      ) : (
                        <p className="text-[10px] text-gray-600">Pending</p>
                      )}
                      {r?.status === 'done' && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </AnimatedCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <AnimatedCard delay={0.15}>
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-heading">
                <Database className="w-3.5 h-3.5" />
                Dataset
              </h3>
              <select
                value={selectedDs || ''}
                onChange={(e) => { setSelectedDs(e.target.value); setResults(null); setActiveTab(null); setShowSummary(true) }}
                className="input text-xs"
              >
                <option value="">Select a dataset</option>
                {datasets.map((ds) => (
                  <option key={ds.name} value={ds.name}>{ds.name} ({ds.rows} rows)</option>
                ))}
              </select>

              <button
                onClick={handleRunAll}
                disabled={!selectedDs || loading}
                className={`relative w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden group ${
                  !selectedDs || loading
                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Play className="w-4 h-4" /> Run Full Analysis</>
                  )}
                </div>
                {!loading && selectedDs && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                )}
              </button>
            </div>
          </AnimatedCard>

          {loading && (
            <AnimatedCard delay={0.2}>
              <div className="card py-4 px-4">
                <StageIndicator completed={progress.completed} total={progress.total} />
                <div className="mt-3 text-center">
                  <p className="text-[10px] text-gray-600 animate-pulse">{infoSnippets[snippetIdx]}</p>
                </div>
              </div>
            </AnimatedCard>
          )}

          {results && (
            <AnimatedCard delay={0.2}>
              <div className="card py-3 px-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-heading">Results</h3>
                  <span className="text-[10px] text-gray-600 font-data">{successCount}/{analysisTypes.length}</span>
                </div>
                <div className="space-y-1">
                  {analysisTypes.map((at) => {
                    const r = results[at.id]
                    return (
                      <TypeBadge
                        key={at.id}
                        type={at}
                        active={activeTab === at.id}
                        onClick={() => { setAutoRotate(false); setActiveTab(at.id) }}
                        done={r?.status === 'done'}
                        error={r?.status === 'error'}
                        disabled={r?.status !== 'done' && r?.status !== 'error'}
                      />
                    )
                  })}
                </div>
                {successCount > 1 && (
                  <div className="mt-3 flex items-center justify-between px-1 pt-2 border-t border-gray-800/50">
                    <button
                      onClick={() => { setAutoRotate(!autoRotate) }}
                      className={`flex items-center gap-1.5 text-[10px] transition-colors ${autoRotate ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {autoRotate ? 'Auto' : 'Manual'}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => navigateTab(-1)} className="p-1 rounded-lg hover:bg-gray-800/50 text-gray-500 hover:text-gray-300 transition-all">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => navigateTab(1)} className="p-1 rounded-lg hover:bg-gray-800/50 text-gray-500 hover:text-gray-300 transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedCard>
          )}

          {allDone && (
            <AnimatedCard delay={0.25}>
              <div className="card py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-gray-300">All analyses complete</span>
                </div>
                {errorCount > 0 && (
                  <p className="text-[10px] text-amber-400 mt-0.5 font-data">{errorCount} analysis{errorCount > 1 ? 'es' : ''} had errors</p>
                )}
                <div className="mt-2 flex gap-1.5 justify-center">
                  {analysisTypes.map(at => {
                    const r = results[at.id]
                    return (
                      <div key={at.id} className={`w-1.5 h-1.5 rounded-full ${r?.status === 'done' ? 'bg-green-500' : r?.status === 'error' ? 'bg-red-500' : 'bg-gray-700'}`} />
                    )
                  })}
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 min-h-[400px]">
          {error && (
            <AnimatedCard delay={0.1}>
              <div className="card border-red-800/50 bg-red-900/10">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            </AnimatedCard>
          )}

          {!results && !loading && !error && (
            <AnimatedCard delay={0.2}>
              <div className="card text-center py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5" />
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/10">
                    <BarChart3 className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2 font-heading">Ready to explore your data?</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    Select a dataset from the sidebar, then click <span className="text-indigo-400 font-medium">Run Full Analysis</span> to run all 7 analysis types in parallel.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    {analysisTypes.map(at => (
                      <span key={at.id} className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.06] text-gray-500 flex items-center gap-1.5">
                        <at.icon className="w-2.5 h-2.5" style={{ color: at.color }} />
                        {at.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {loading && (
            <AnimatedCard delay={0.2}>
              <div className="card text-center py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-cyan-600/5" />
                <div className="relative">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 animate-pulse opacity-20 blur-xl" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-600/20 flex items-center justify-center border border-indigo-500/10">
                      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2 animate-pulse font-heading">Crunching the numbers</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                    <span className="text-indigo-400 font-medium font-data">{progress.completed}</span> of{' '}
                    <span className="text-indigo-400 font-medium font-data">{analysisTypes.length}</span> analyses complete
                  </p>
                  <div className="flex gap-2 justify-center mt-6">
                    {analysisTypes.slice(0, progress.completed).map(at => (
                      <div key={at.id} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: at.color, animationDelay: `${Math.random() * 0.5}s` }} />
                    ))}
                    {analysisTypes.slice(progress.completed).map(at => (
                      <div key={at.id} className="w-2 h-2 rounded-full bg-gray-800" />
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {currentResult && currentResult.status === 'done' && currentType && (
            <>
              {/* Result Header */}
              <AnimatedCard delay={0.1}>
                <div className="card relative overflow-hidden" style={{ borderColor: `${currentType.color}20` }}>
                  <div className="absolute inset-0 bg-gradient-to-r opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${currentType.color} 0%, transparent 100%)` }} />
                  <div className="relative flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-110"
                      style={{
                        backgroundColor: `${currentType.color}20`,
                        boxShadow: `0 8px 32px ${currentType.color}20`,
                      }}
                    >
                      <currentType.icon className="w-6 h-6" style={{ color: currentType.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-100 font-heading">{currentResult.title}</h2>
                        {allDone && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            Live
                          </span>
                        )}
                      </div>
                      {currentResult.summary && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed max-w-2xl">{currentResult.summary}</p>
                      )}
                    </div>
                    {allDone && (
                      <div className="flex gap-1">
                        <button onClick={() => navigateTab(-1)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigateTab(1)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>

              {/* Visualizations */}
              {currentResult.visualizations?.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {currentResult.visualizations.map((viz, i) => renderViz(viz, i))}
                </div>
              )}

              {/* Insights + Recommendations side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentResult.insights?.length > 0 && (
                  <AnimatedCard delay={0.3}>
                    <div className="card h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-200 font-heading">Key Insights</h3>
                        <span className="text-[10px] text-gray-600 ml-auto font-data">{currentResult.insights.length}</span>
                      </div>
                      <div className="space-y-2.5">
                        {currentResult.insights.map((insight, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 text-xs leading-relaxed group cursor-default"
                          >
                            <span
                              className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-150 transition-transform duration-300"
                              style={{ backgroundColor: currentType.color }}
                            />
                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AnimatedCard>
                )}

                {currentResult.recommendations?.length > 0 && (
                  <AnimatedCard delay={0.4}>
                    <div className="card h-full relative overflow-hidden" style={{ borderColor: `${currentType.color}10` }}>
                      <div className="absolute inset-0 bg-gradient-to-br opacity-[0.02]" style={{ background: `linear-gradient(135deg, ${currentType.color} 0%, transparent 100%)` }} />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                            <Target className="w-3.5 h-3.5 text-green-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-200 font-heading">Recommendations</h3>
                          <span className="text-[10px] text-gray-600 ml-auto font-data">{currentResult.recommendations.length}</span>
                        </div>
                        <div className="space-y-2.5">
                          {currentResult.recommendations.map((rec, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 text-xs leading-relaxed group cursor-default"
                            >
                              <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 bg-green-500 group-hover:scale-150 transition-transform duration-300" />
                              <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                )}
              </div>

              {/* Footer */}
              <AnimatedCard delay={0.5}>
                <div className="flex items-center justify-between text-[10px] text-gray-600 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Analysis complete
                    {autoRotate && successCount > 1 && (
                      <span className="text-gray-700 ml-1">· Auto-rotating</span>
                    )}
                  </div>
                  <span className="text-gray-700 font-data">
                    {activeTab} · {currentResult.visualizations?.length || 0} charts
                  </span>
                </div>
              </AnimatedCard>
            </>
          )}

          {currentResult?.status === 'error' && (
            <AnimatedCard delay={0.2}>
              <div className="card border-red-800/50 bg-red-900/10 text-center py-12">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-red-300 mb-1 font-heading">Analysis Failed</h3>
                <p className="text-xs text-red-400/80">{currentResult.error || 'An unknown error occurred'}</p>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  )
}
