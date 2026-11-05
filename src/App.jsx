import { useState, useEffect } from 'react'
import { supabase } from "./supabaseClient"

// Views & Pages
import LandingPage from './components/pages/LandingPage'
import ResidentPortal from './components/public/ResidentPortal';

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

import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'admin' o 'resident'
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [checkingRole, setCheckingRole] = useState(true)
  
  // Navigation View State: 'landing', 'login', 'admin', 'portal'
  const [currentView, setCurrentView] = useState('landing')

  // Login Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Listahan ng kilalang Admin Emails (Fallback validation)
  const ADMIN_EMAILS = [
    'admin@sannicolas.gov.ph',
    'edwardraquipo26@gmail.com' // I-update ayon sa iyong admin email
  ]

  useEffect(() => {
    // Kunin ang kasalukuyang session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        verifyUserRole(session.user.email)
      } else {
        setCheckingRole(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        await verifyUserRole(session.user.email)
      } else {
        setUserRole(null)
        setCheckingRole(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Suriin ang Role ng User mula sa Supabase at Email
  const verifyUserRole = async (userEmail) => {
    setCheckingRole(true)
    
    // Check sa residents database table
    const { data, error } = await supabase
      .from('residents')
      .select('role')
      .eq('email', userEmail)
      .maybeSingle()

    let detectedRole = 'resident'

    if (data && data.role === 'admin') {
      detectedRole = 'admin'
    } else if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      detectedRole = 'admin'
    }

    setUserRole(detectedRole)
    setCheckingRole(false)
  }

  // Handle User Authentication Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else if (data?.user) {
      await verifyUserRole(data.user.email)
      setLoading(false)
    }
  }

  // Handle User Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUserRole(null)
    setCurrentView('landing')
  }

  if (checkingRole) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: '700', fontSize: '14px' }}>
        Checking user authorization...
      </div>
    )
  }

  // ROUTE 1: Kung may nakalogin na Session
  if (session) {
    // KUNG REGULAR RESIDENT: Direkta sa Resident Portal
    if (userRole !== 'admin') {
      return <ResidentPortal currentUserEmail={session.user.email} onSignOut={handleLogout} />
    }

    // KUNG ADMIN: Papayagan sa Admin Dashboard Layout
    return (
      <div className="admin-app-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="admin-main-container">
          <Header user={session?.user} onLogout={handleLogout} />

          <main className="admin-content-area">
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

  // ROUTE 2: Direct URL o Public Portal Request
  if (window.location.pathname === '/request' || currentView === 'public-request') {
    return <ResidentPortal onBack={() => setCurrentView('landing')} />
  }

  // ROUTE 3: Landing Page kapag hindi nakalogin
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onNavigateLogin={() => setCurrentView('login')} 
        onNavigatePublicRequest={() => setCurrentView('public-request')} 
      />
    )
  }

  // ROUTE 4: Login Form (Unified Login)
  return (
    <div className="login-wrapper">
      <div className="login-card-box">
        <button 
          onClick={() => setCurrentView('landing')} 
          className="btn-back-link"
        >
          ← Back to Home
        </button>
        
        <h2 className="login-title">Barangay San Nicolas</h2>
        <p className="login-subtitle">
          Portal Login System
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <div>
            <label className="login-label">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div>
            <label className="login-label">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>

          {errorMsg && (
            <p className="login-error-msg">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App