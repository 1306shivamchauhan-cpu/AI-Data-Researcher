import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Sparkles, ArrowRight, ChevronDown, Shield, Zap, BarChart3, MessageSquare } from 'lucide-react'
import PixelReveal, { PixelCard, PixelButton } from './PixelReveal'

const features = [
  { icon: MessageSquare, title: 'Conversational Analytics', desc: 'Ask questions in natural language and get AI-powered answers from your data' },
  { icon: BarChart3, title: 'AI Insights Engine', desc: 'Automated pattern detection, anomaly identification, and trend analysis' },
  { icon: Zap, title: 'Predictive Forecasting', desc: 'ML-based predictions to anticipate future outcomes and inform decisions' },
  { icon: Shield, title: 'Community Intelligence', desc: 'Designed for urban mobility, wellness, safety, education & more' },
]

const pixelDemos = [
  { label: 'Urban Mobility', rows: 500, cols: 9 },
  { label: 'Community Wellness', rows: 500, cols: 9 },
  { label: 'Environmental', rows: 500, cols: 10 },
  { label: 'Public Safety', rows: 500, cols: 9 },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('landing')
  const [showScanner, setShowScanner] = useState(false)
  const featuresRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowScanner((prev) => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = () => {
    navigate('/dashboard')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-gray-950 overflow-hidden">
        {/* Matrix-style scan line overlay */}
        <div className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-700 ${showScanner ? 'opacity-20' : 'opacity-0'}`}>
          <div className="w-full h-[2px] bg-brand-400/30 absolute top-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
        </div>

        {/* Pixel grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
        </div>

        {/* Animated gradient orbs */}
        <div className="fixed top-1/4 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-600/10 border border-brand-500/20">
              <Brain className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-white">Decision Intelligence</h1>
              <p className="text-[10px] text-gray-500">Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode('login')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <PixelButton
              onClick={() => setMode('login')}
              className="btn-primary text-sm"
            >
              Get Started
            </PixelButton>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
          <PixelReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-400 text-xs mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Decision Intelligence
            </div>
          </PixelReveal>

          <PixelReveal delay={0.15}>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Make Smarter Decisions
              <br />
              <span className="gradient-text">With AI</span>
            </h1>
          </PixelReveal>

          <PixelReveal delay={0.3}>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Analyze data, generate insights, predict outcomes, and automate decision-making
              across urban mobility, public safety, healthcare, education, and more.
            </p>
          </PixelReveal>

          <PixelReveal delay={0.45}>
            <div className="mt-10 flex items-center justify-center gap-4">
              <PixelButton
                onClick={() => setMode('login')}
                className="btn-primary px-8 py-3 text-base"
              >
                Enter Platform
                <ArrowRight className="w-4 h-4 ml-2" />
              </PixelButton>
              <button
                onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary px-8 py-3 text-base"
              >
                Learn More
              </button>
            </div>
          </PixelReveal>

          <PixelReveal delay={0.6}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {pixelDemos.map((d) => (
                <div key={d.label} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
                  <p className="text-xs text-gray-500">Sample Data</p>
                  <p className="text-sm font-medium text-white mt-1">{d.label}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{d.rows} rows &middot; {d.cols} metrics</p>
                </div>
              ))}
            </div>
          </PixelReveal>

          <div className="mt-16 animate-bounce">
            <ChevronDown className="w-5 h-5 mx-auto text-gray-600" />
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Powered by Intelligence</h2>
            <p className="mt-3 text-gray-400">Everything you need to turn data into decisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <PixelCard key={f.title} delay={i * 0.15}>
                <div className="card-hover p-8">
                  <div className="p-3 rounded-xl bg-brand-600/10 border border-brand-500/20 w-fit mb-5">
                    <f.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </PixelCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32 text-center">
          <PixelCard delay={0.3}>
            <div className="card-hover p-12 border-brand-500/20 bg-gradient-to-br from-gray-900 via-brand-950/30 to-gray-900">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your data?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join communities and organizations using AI-powered intelligence to make better decisions every day.
              </p>
              <PixelButton
                onClick={() => setMode('login')}
                className="btn-primary px-10 py-3 text-base"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </PixelButton>
            </div>
          </PixelCard>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-800/50 py-8">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Brain className="w-4 h-4" />
              Decision Intelligence Platform
            </div>
            <p className="text-xs text-gray-700">v1.0.0</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>
      <div className="fixed top-1/3 -left-32 w-80 h-80 bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="fixed bottom-1/3 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <button
          onClick={() => setMode(mode === 'signup' ? 'login' : 'landing')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors mx-auto"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          {mode === 'signup' ? 'Back to Sign In' : 'Back'}
        </button>

        <PixelReveal>
          <div className="text-center mb-8">
            <div className="p-3 rounded-xl bg-brand-600/10 border border-brand-500/20 w-fit mx-auto mb-4">
              <Brain className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome</h1>
            <p className="text-sm text-gray-400 mt-2">Sign in to the Decision Intelligence Platform</p>
          </div>
        </PixelReveal>

        <PixelReveal delay={0.15}>
          <form onSubmit={handleLogin} className="card space-y-5 p-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-700 bg-gray-800" />
                Remember me
              </label>
              <button type="button" className="text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <PixelButton type="submit" className="btn-primary w-full py-3">
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </PixelButton>

            <p className="text-center text-xs text-gray-600 pt-2">
              By signing in, you agree to the Terms of Service
            </p>
          </form>
        </PixelReveal>

        {mode === 'login' && (
          <PixelReveal delay={0.3}>
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
              >
                Create one
              </button>
            </p>
          </PixelReveal>
        )}

        {mode === 'signup' && (
          <>
            <PixelReveal>
              <div className="text-center mb-8">
                <div className="p-3 rounded-xl bg-brand-600/10 border border-brand-500/20 w-fit mx-auto mb-4">
                  <Brain className="w-8 h-8 text-brand-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Create Account</h1>
                <p className="text-sm text-gray-400 mt-2">Join the Decision Intelligence Platform</p>
              </div>
            </PixelReveal>

            <PixelReveal delay={0.15}>
              <form onSubmit={handleLogin} className="card space-y-5 p-8">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 8 characters)"
                    className="input"
                    minLength={8}
                    required
                  />
                </div>
                <PixelButton type="submit" className="btn-primary w-full py-3">
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </PixelButton>
                <p className="text-center text-xs text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </PixelReveal>
          </>
        )}

        <p className="text-center text-[10px] text-gray-700 mt-8">
          Decision Intelligence Platform v1.0.0
        </p>
      </div>
    </div>
  )
}
