import React from 'react'
import './Sidebar.css'

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'residents', label: 'Resident Profiles', icon: '👥' },
    { id: 'documents', label: 'Document Services', icon: '📄' },
    { id: 'incidents', label: 'Blotter & Incidents', icon: '⚖️' },
    { id: 'finances', label: 'Budget & Expenses', icon: '💳' },
    { id: 'reports', label: 'Reports Module', icon: '📈' },
  ]

  return (
    <aside className="sidebar-container">
      <div>
        {/* Header Section */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">BRGY. SAN NICOLAS</h2>
          <p className="sidebar-subtitle">Castillejos, Zambales</p>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
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

      {/* Slogan Card Footer */}
      <div className="sidebar-footer">
        <div className="slogan-card">
          <p className="slogan-text">"Bayanihan para sa mas maunlad na Barangay"</p>
        </div>
      </div>
    </aside>
  )
}