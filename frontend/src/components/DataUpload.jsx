import { useState, useEffect, useCallback } from 'react'
import {
  Upload, Database, FileSpreadsheet, FileJson, FileText,
  Trash2, Download, Eye, Brain, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { api } from '../utils/api'

const sampleDomains = [
  { id: 'urban_mobility', label: 'Urban Mobility', desc: 'Traffic, congestion, transit' },
  { id: 'community_wellness', label: 'Community Wellness', desc: 'Health programs, engagement' },
  { id: 'environmental', label: 'Environmental', desc: 'Air quality, energy, waste' },
  { id: 'public_safety', label: 'Public Safety', desc: 'Incidents, response times' },
  { id: 'education', label: 'Education', desc: 'Enrollment, outcomes' },
]

export default function DataUpload() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(null)
  const [selectedDs, setSelectedDs] = useState(null)
  const [preview, setPreview] = useState(null)
  const [summary, setSummary] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [notification, setNotification] = useState(null)

  const loadDatasets = useCallback(async () => {
    try {
      const d = await api.getDatasets()
      setDatasets(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDatasets() }, [loadDatasets])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleFileUpload = async (file) => {
    setUploading(true)
    try {
      const res = await api.uploadData(file)
      showNotification('success', `Uploaded "${file.name}" — ${res.rows} rows`)
      await loadDatasets()
    } catch (e) {
      showNotification('error', e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleGenerate = async (domain) => {
    setGenerating(domain)
    try {
      const res = await api.generateSample(domain)
      showNotification('success', `Created sample dataset: ${res.data_source}`)
      await loadDatasets()
    } catch (e) {
      showNotification('error', e.message)
    } finally {
      setGenerating(null)
    }
  }

  const handleSelect = async (name) => {
    setSelectedDs(name)
    setDetailLoading(true)
    try {
      const [p, s] = await Promise.all([
        api.getPreview(name, 20),
        api.getSummary(name),
      ])
      setPreview(p)
      setSummary(s)
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm ${
          notification.type === 'success' ? 'bg-green-900/90 border border-green-700 text-green-200'
            : 'bg-red-900/90 border border-red-700 text-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold gradient-text font-heading">Data Sources</h1>
        <p className="text-sm text-gray-500 mt-1">Upload your data or generate sample datasets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`card-hover border-2 border-dashed text-center p-8 transition-colors ${
            dragOver ? 'border-brand-500 bg-brand-600/5' : 'border-gray-700'
          }`}
        >
          <Upload className={`w-10 h-10 mx-auto mb-4 ${dragOver ? 'text-brand-400' : 'text-gray-600'}`} />
          <h3 className="font-medium text-sm font-heading">Upload Data File</h3>
          <p className="text-xs text-gray-500 mt-2 mb-4">CSV, JSON, or Excel — drag & drop or browse</p>
          <label className="btn-primary cursor-pointer inline-flex">
            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={(e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]) }}
              className="hidden"
            />
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            Choose File
          </label>
          {uploading && <p className="text-xs text-brand-400 mt-3">Uploading...</p>}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-brand-400" />
            <h3 className="font-medium text-sm font-heading">Generate Sample Data</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sampleDomains.map((d) => (
              <button
                key={d.id}
                onClick={() => handleGenerate(d.id)}
                disabled={generating === d.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 
                         border border-gray-800 hover:border-brand-500/30 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </div>
                {generating === d.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                ) : (
                  <Brain className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 font-heading">
          Datasets
          {datasets.length > 0 && <span className="text-sm text-gray-500 ml-2">({datasets.length})</span>}
        </h2>

        {loading ? (
          <div className="card text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="card text-center py-8">
            <Database className="w-8 h-8 mx-auto text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">No datasets loaded yet</p>
            <p className="text-xs text-gray-600 mt-1">Upload a file or generate sample data to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {datasets.map((ds) => (
                <button
                  key={ds.name}
                  onClick={() => handleSelect(ds.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedDs === ds.name
                      ? 'bg-brand-600/10 border-brand-500/30 text-brand-400'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{ds.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ds.rows.toLocaleString()} rows · {ds.columns} columns
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {!selectedDs ? (
                <div className="card text-center py-8 h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500">Select a dataset to view details</p>
                </div>
              ) : detailLoading ? (
                <div className="card text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="card">
                    <h3 className="font-medium text-sm mb-3 font-heading">Summary</h3>
                    {summary && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Rows:</span> {summary.rows}</div>
                        <div><span className="text-gray-500">Columns:</span> {summary.columns?.length}</div>
                        <div><span className="text-gray-500">Numeric:</span> {summary.numeric_columns?.length}</div>
                        <div><span className="text-gray-500">Categorical:</span> {summary.categorical_columns?.length}</div>
                      </div>
                    )}
                  </div>

                  {preview && preview.length > 0 && (
                    <div className="card overflow-x-auto">
                      <h3 className="font-medium text-sm mb-3 font-heading">Preview (first {preview.length} rows)</h3>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-800">
                            {Object.keys(preview[0]).map((col) => (
                              <th key={col} className="text-left py-2 px-3 text-gray-400 font-medium whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.map((row, i) => (
                            <tr key={i} className="border-b border-gray-800/50 last:border-0">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="py-2 px-3 text-gray-300 whitespace-nowrap">
                                  {val == null ? '—' : String(val).slice(0, 30)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
