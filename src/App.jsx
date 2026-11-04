import { useState, useEffect } from 'react'
import { supabase } from "./supabaseClient"

// Views & Pages
import LandingPage from './components/pages/LandingPage'
import ResidentPortal from './components/public/ResidentPortal'

// Admin Components
import Sidebar from './components/Sidebar'
import Header from './components/Header'

// Admin Pages
import Dashboard from './components/pages/Dashboard'
import Residents from './components/pages/Residents'
import DocumentServices from './components/pages/DocumentServices'
import Incidents from './components/pages/Incidents'
import Finances from './components/pages/Finances'
import Reports from './components/pages/Reports'

function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('Dashboard')
  
  // Navigation View State: 'landing', 'login', 'admin', or 'public-request'
  const [currentView, setCurrentView] = useState('landing')

  // Login Form States for Admin
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Route para sa Resident E-Governance Portal
  if (window.location.pathname === '/request' || currentView === 'public-request') {
    return <ResidentPortal onBack={() => setCurrentView('landing')} />
  }

  // Handle Admin User Authentication
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setCurrentView('admin')
    }
    setLoading(false)
  }

  // Handle User Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentView('landing')
  }

  // 1. Render Landing Page kung wala pang session at nasa landing view
  if (currentView === 'landing' && !session) {
    return (
      <LandingPage 
        onNavigateLogin={() => setCurrentView('login')} 
        onNavigatePublicRequest={() => setCurrentView('public-request')} 
      />
    )
  }

  // 2. Render Admin Login Form
  if (currentView === 'login' && !session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' }}>
          <button 
            onClick={() => setCurrentView('landing')} 
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', fontWeight: '600', padding: 0 }}
          >
            ← Back to Home
          </button>
          
          <h2 style={{ textAlign: 'center', margin: '0 0 4px 0', color: '#0f172a', fontSize: '20px', fontWeight: '800' }}>Barangay San Nicolas</h2>
          <p style={{ textAlign: 'center', margin: '0 0 24px 0', color: '#64748b', fontSize: '13px' }}>
            Admin Portal Login
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '700', color: '#334155' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '700', color: '#334155' }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>

            {errorMsg && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, backgroundColor: '#fef2f2', padding: '8px', borderRadius: '6px' }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                marginTop: '6px',
                fontSize: '13px'
              }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 3. Render Admin Portal Dashboard pagka-login ng Admin
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header user={session?.user} onLogout={handleLogout} />

        <main style={{ padding: '20px', flex: 1, boxSizing: 'border-box', overflowY: 'auto' }}>
          {activeTab.toLowerCase().includes('dashboard') && <Dashboard />}
          {(activeTab.toLowerCase().includes('resident') || activeTab.toLowerCase().includes('residents')) && <Residents />}
          {(activeTab.toLowerCase().includes('document') || activeTab.toLowerCase().includes('services')) && (
            <DocumentServices onBack={() => setActiveTab('Dashboard')} />
          )}
          {(activeTab.toLowerCase().includes('blotter') || activeTab.toLowerCase().includes('incident')) && <Incidents />}
          {(activeTab.toLowerCase().includes('budget') || activeTab.toLowerCase().includes('finance')) && <Finances />}
          {(activeTab.toLowerCase().includes('report') || activeTab.toLowerCase().includes('reports')) && <Reports />}
        </main>
      </div>
    </div>
  )
}

export default App