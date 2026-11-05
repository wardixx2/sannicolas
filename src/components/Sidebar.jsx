import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShieldAlert, 
  WalletCards, 
  BarChart3, 
  CheckCircle2 
} from 'lucide-react'
import './Sidebar.css'

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'residents', label: 'Resident Profiles', icon: <Users size={18} /> },
    { id: 'documents', label: 'Document Services', icon: <FileText size={18} /> },
    { id: 'incidents', label: 'Blotter & Incidents', icon: <ShieldAlert size={18} /> },
    { id: 'finances', label: 'Budget & Expenses', icon: <WalletCards size={18} /> },
    { id: 'reports', label: 'Reports Module', icon: <BarChart3 size={18} /> },
  ]

  return (
    <aside className="sidebar-container">
      <div>
        {/* Header Section */}
        <div className="sidebar-header">
          <div className="sidebar-brand-badge">SN</div>
          <div>
            <h2 className="sidebar-title">BRGY. SAN NICOLAS</h2>
            <p className="sidebar-subtitle">Castillejos, Zambales</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">MAIN NAVIGATION</div>
          {navItems.map((item) => {
            const isActive = activeTab?.toLowerCase().includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Modern Footer Card */}
      <div className="sidebar-footer">
        <div className="system-status-box">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">System Online</span>
          </div>
          <p className="slogan-text">"Bayanihan para sa mas maunlad na Barangay"</p>
        </div>
      </div>
    </aside>
  )
}