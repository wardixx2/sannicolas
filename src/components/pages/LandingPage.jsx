import React from 'react'
import './LandingPage.css'

export default function LandingPage({ onNavigateLogin, onNavigatePublicRequest }) {
  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-navbar">
        <div className="navbar-brand">
          <span className="brand-badge">BSN</span>
          <div>
            <h2>BARANGAY SAN NICOLAS</h2>
            <p>Castillejos, Zambales</p>
          </div>
        </div>
        <div className="navbar-actions">
          <button onClick={onNavigatePublicRequest} className="btn-outline">
            Online Request Portal
          </button>
          <button onClick={onNavigateLogin} className="btn-primary">
            Admin Login
          </button>
        </div>
      </header>

      {/* Compact Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">Official Municipal Services Portal</span>
          <h1>Welcome to Barangay San Nicolas</h1>
          <p>
            A fast, secure, and modern system for resident records, official document processing, and community services.
          </p>
          <div className="hero-buttons">
            <button onClick={onNavigatePublicRequest} className="btn-hero-main">
              Request Document Online →
            </button>
          </div>
        </div>
      </section>

      {/* Compact Services Grid Section */}
      <section className="services-section">
        <h3 className="section-title">Core Services</h3>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📄</div>
            <h4>Online Document Requests</h4>
            <p>Apply for Clearances & Certificates online.</p>
          </div>

          <div className="service-card">
            <div className="service-icon">👥</div>
            <h4>Resident Profiles</h4>
            <p>Centralized secure demographic database.</p>
          </div>

          <div className="service-card">
            <div className="service-icon">📁</div>
            <h4>Blotter & Incidents</h4>
            <p>Track complaints and community cases.</p>
          </div>

          <div className="service-card">
            <div className="service-icon">📊</div>
            <h4>Financial Transparency</h4>
            <p>Monitor municipal funds & project budgets.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 Barangay San Nicolas, Castillejos, Zambales. All Rights Reserved.</p>
      </footer>
    </div>
  )
}