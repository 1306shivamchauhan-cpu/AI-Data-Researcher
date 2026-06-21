import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Database, Sparkles } from 'lucide-react'
import { api } from '../utils/api'

export default function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [datasets, setDatasets] = useState([])
  const [selectedDataset, setSelectedDataset] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    api.getDatasets().then(setDatasets).catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await api.chat(userMessage, conversationId, selectedDataset)
      setConversationId(res.conversation_id)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    'What patterns do you see in this data?',
    'Are there any anomalies or outliers?',
    'What recommendations can you make?',
    'Summarize the key trends',
    'Which factors are most correlated?',
  ]

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold gradient-text font-heading">Analytics Chat</h1>
          <p className="text-sm text-gray-500">Ask questions about your data in natural language</p>
        </div>
        {datasets.length > 0 && (
          <select
            value={selectedDataset || ''}
            onChange={(e) => setSelectedDataset(e.target.value || null)}
            className="input max-w-xs text-xs"
          >
            <option value="">All data (no specific source)</option>
            {datasets.map((ds) => (
              <option key={ds.name} value={ds.name}>
                {ds.name} ({ds.rows} rows)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Bot className="w-12 h-12 text-brand-400/50 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 font-heading">Start a conversation</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                Ask questions about your data, request analysis, or explore patterns.
                The AI will use the selected dataset as context.
              </p>
              {!selectedDataset && datasets.length > 0 && (
                <p className="text-xs text-yellow-500 mt-2">
                  Select a dataset above for data-aware responses
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q)
                    }}
                    className="px-3 py-1.5 text-xs rounded-full bg-gray-800 border border-gray-700 
                               text-gray-400 hover:text-gray-200 hover:border-brand-500/50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="p-2 rounded-lg bg-brand-600/10 border border-brand-500/20 h-fit">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-800/50 border border-gray-800 text-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="p-2 rounded-lg bg-gray-800 border border-gray-700 h-fit">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-brand-600/10 border border-brand-500/20">
                <Bot className="w-4 h-4 text-brand-400" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-gray-800/50 border border-gray-800">
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your data..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="btn-primary px-5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {selectedDataset && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Database className="w-3 h-3" />
              Analyzing with context: {selectedDataset}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
