import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Search, Plus, X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react'
import './Incidents.css'

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    case_number: `BLOTTER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    complainant_name: '',
    respondent_name: '',
    incident_type: 'Noise Disturbance',
    purok: 'Purok 1',
    incident_date: new Date().toISOString().split('T')[0],
    details: ''
  })

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching incidents:', error.message)
    } else {
      setIncidents(data || [])
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('incidents')
      .insert([formData])

    if (error) {
      alert('Error recording incident: ' + error.message)
    } else {
      alert('Blotter record created successfully!')
      setShowModal(false)
      setFormData({
        case_number: `BLOTTER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        complainant_name: '',
        respondent_name: '',
        incident_type: 'Noise Disturbance',
        purok: 'Purok 1',
        incident_date: new Date().toISOString().split('T')[0],
        details: ''
      })
      fetchIncidents()
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (id, newStatus) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      fetchIncidents()
    }
  }

  const filteredIncidents = incidents.filter(i =>
    i.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.respondent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.incident_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-dashboard-wrapper">
      {/* Page Header */}
      <div className="dashboard-top-flex">
        <div>
          <h1 className="dash-title">Blotter & Incident Management</h1>
          <p className="dash-subtitle">Record and track barangay complaints, blotter reports, and dispute resolutions.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-add-resident">
          <Plus size={16} /> File New Incident Report
        </button>
      </div>

      <div className="admin-panel-card">
        {/* Action Bar with Modern Search Bar */}
        <div className="panel-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#2563eb" />
            <h3 className="panel-heading-title" style={{ margin: 0 }}>Blotter Records ({filteredIncidents.length})</h3>
          </div>

          <div className="modern-search-wrapper">
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search case no, names, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="search-clear-btn">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="panel-divider-line"></div>

        {/* Data Table */}
        <div className="table-responsive-container">
          <table className="pro-admin-table">
            <thead>
              <tr>
                <th>Case No.</th>
                <th>Complainant</th>
                <th>Respondent</th>
                <th>Incident Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-state-box">Loading incident reports...</td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-state-box">No blotter records found.</td>
                </tr>
              ) : (
                filteredIncidents.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.case_number}</strong></td>
                    <td>{item.complainant_name}</td>
                    <td>{item.respondent_name}</td>
                    <td>{item.incident_type}</td>
                    <td>{item.incident_date}</td>
                    <td>
                      <span className={`status-pill ${item.status === 'Active' ? 'active-case' : item.status === 'Settled' ? 'settled-case' : 'escalated-case'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(!item.status || item.status === 'Active') && (
                          <>
                            <button onClick={() => handleStatusUpdate(item.id, 'Settled')} className="btn-settle">
                              Mark Settled
                            </button>
                            <button onClick={() => handleStatusUpdate(item.id, 'Escalated')} className="btn-escalate">
                              Escalate
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>New Blotter / Incident Entry</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="form-label">Case Reference Number</label>
                <input
                  type="text"
                  name="case_number"
                  value={formData.case_number}
                  readOnly
                  className="form-input"
                  style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="form-label">Complainant Name</label>
                  <input
                    type="text"
                    name="complainant_name"
                    value={formData.complainant_name}
                    onChange={handleChange}
                    required
                    placeholder="Complainant full name"
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="form-label">Respondent Name</label>
                  <input
                    type="text"
                    name="respondent_name"
                    value={formData.respondent_name}
                    onChange={handleChange}
                    required
                    placeholder="Respondent full name"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="form-label">Incident Type</label>
                  <select
                    name="incident_type"
                    value={formData.incident_type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Noise Disturbance">Noise Disturbance</option>
                    <option value="Physical Dispute / Altercation">Physical Dispute / Altercation</option>
                    <option value="Property Damage / Boundary Issue">Property Damage / Boundary Issue</option>
                    <option value="Theft / Trespassing">Theft / Trespassing</option>
                    <option value="Other Misconduct">Other Misconduct</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="form-label">Purok Location</label>
                  <input
                    type="text"
                    name="purok"
                    value={formData.purok}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Incident Date</label>
                <input
                  type="date"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="form-label">Details / Narrative Description</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="3"
                  className="form-input"
                  placeholder="Provide brief statement or details of the complaint..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel-mode"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-save-changes"
                >
                  {loading ? 'Saving...' : 'Save Incident Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}