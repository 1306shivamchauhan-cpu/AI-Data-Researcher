const API_BASE = '/api'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type']
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Request failed: ${response.status}`)
  }

  return response.json()
}

export const api = {
  health: () => request('/health'),
  info: () => request('/info'),

  chat: (message, conversationId, dataSource) =>
    request('/chat', {
      method: 'POST',
      body: { message, conversation_id: conversationId, data_source: dataSource },
    }),

  getDatasets: () => request('/data/datasets'),
  uploadData: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request('/data/upload', { method: 'POST', body: formData })
  },
  generateSample: (domain) => {
    const formData = new FormData()
    formData.append('domain', domain)
    return request('/data/generate-sample', { method: 'POST', body: formData })
  },
  getPreview: (name, n = 10) => request(`/data/preview/${name}?n=${n}`),
  getSummary: (name) => request(`/data/summary/${name}`),

  analyze: (dataSource, analysisType, targetColumn = null, parameters = null) =>
    request('/analysis', {
      method: 'POST',
      body: { data_source: dataSource, analysis_type: analysisType, target_column: targetColumn, parameters },
    }),
  getAnalysisTypes: () => request('/analysis/types'),

  predict: (dataSource, targetColumn, periods = 12, frequency = 'M') =>
    request('/predictions', {
      method: 'POST',
      body: { data_source: dataSource, target_column: targetColumn, periods, frequency },
    }),
}
