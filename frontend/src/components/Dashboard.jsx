import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, MessageSquare, Upload, BarChart3, TrendingUp,
  ArrowRight, Activity, Database, Zap, Shield,
} from 'lucide-react'
import { api } from '../utils/api'

const capabilities = [
  {
    icon: MessageSquare,
    title: 'Conversational Analytics',
    desc: 'Ask questions about your data in natural language and get AI-powered answers',
    path: '/chat',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Upload,
    title: 'Multi-Format Data Ingestion',
    desc: 'Upload CSV, JSON, or Excel files. Generate sample datasets for exploration',
    path: '/data',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    desc: 'Automated correlation, trend, cluster, and anomaly analysis with recommendations',
    path: '/insights',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    desc: 'ML-based forecasting to predict future trends and support proactive decisions',
    path: '/predictions',
    color: 'from-green-500 to-emerald-500',
  },
]

const sampleDomainCards = [
  { label: 'Urban Mobility', domain: 'urban_mobility', desc: 'Traffic, congestion, transit data' },
  { label: 'Community Wellness', domain: 'community_wellness', desc: 'Health programs, engagement metrics' },
  { label: 'Environmental', domain: 'environmental', desc: 'Air quality, energy, waste data' },
  { label: 'Public Safety', domain: 'public_safety', desc: 'Incidents, response times, severity' },
  { label: 'Education', domain: 'education', desc: 'Enrollment, outcomes, resources' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [health, setHealth] = useState(null)
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.health().catch(() => ({ status: 'offline' })),
      api.getDatasets().catch(() => []),
    ]).then(([h, d]) => {
      setHealth(h)
      setDatasets(d)
      setLoading(false)
    })
  }, [])

  const handleGenerateSample = async (domain) => {
    try {
      await api.generateSample(domain)
      const d = await api.getDatasets()
      setDatasets(d)
    } catch (e) {
      console.error(e)
    }
  }

  const totalRows = datasets.reduce((sum, ds) => sum + ds.rows, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text font-heading">Decision Intelligence Platform</h1>
        <p className="mt-2 text-gray-400">
          AI-powered analytics and decision support for communities and organizations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Status</span>
          </div>
          <p className="mt-2 text-lg font-semibold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
            {health?.status === 'healthy' ? 'Online' : 'Checking...'}
          </p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Datasets</span>
          </div>
          <p className="mt-2 text-lg font-semibold font-data">{datasets.length}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Data Points</span>
          </div>
          <p className="mt-2 text-lg font-semibold font-data">{totalRows.toLocaleString()}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Capabilities</span>
          </div>
          <p className="mt-2 text-lg font-semibold font-data">{capabilities.length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 font-heading">Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap) => (
            <button
              key={cap.path}
              onClick={() => navigate(cap.path)}
              className="card-hover text-left group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${cap.color} bg-opacity-10`}>
                  <cap.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm flex items-center gap-2 font-heading">
                    {cap.title}
                    <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-brand-400 transition-colors" />
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{cap.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-heading">Quick Start — Sample Data</h2>
          <span className="text-xs text-gray-500">Generate a pre-built dataset</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {sampleDomainCards.map((card) => (
            <button
              key={card.domain}
              onClick={() => handleGenerateSample(card.domain)}
              className="card-hover text-center group cursor-pointer"
            >
              <Brain className="w-5 h-5 mx-auto text-brand-400 group-hover:scale-110 transition-transform" />
              <p className="mt-2 font-medium text-xs">{card.label}</p>
              <p className="mt-1 text-[10px] text-gray-600">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {datasets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 font-heading">Active Datasets</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Rows</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Columns</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((ds) => (
                  <tr key={ds.name} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-3 px-4 font-medium">{ds.name}</td>
                    <td className="py-3 px-4 text-right text-gray-400 font-data">{ds.rows.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-400 font-data">{ds.columns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
