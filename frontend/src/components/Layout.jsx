import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, Upload, BarChart3, TrendingUp,
  Menu, X, Brain, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/chat', icon: MessageSquare, label: 'Analytics Chat' },
  { to: '/data', icon: Upload, label: 'Data Sources' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/predictions', icon: TrendingUp, label: 'Predictions' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 glass border-r border-gray-800/50 transform transition-transform duration-200 lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800/50">
          <div className="p-2 rounded-lg bg-brand-600/10 border border-brand-500/20">
            <Brain className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Decision</h1>
            <p className="text-xs text-gray-500">Intelligence Platform</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent',
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {location.pathname === item.to && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">AI Engine Active</span>
          </div>
        </div>
      </aside>

      <div className={clsx(
        'fixed inset-0 bg-black/50 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden',
      )} onClick={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-gray-800/50">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-xs text-gray-500 hidden sm:block">v1.0.0</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
