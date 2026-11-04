import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
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
    <div className="incidents-container">
      {/* Page Header */}
      <div className="incidents-header">
        <div>
          <h1 className="incidents-title">Blotter & Incident Management</h1>
          <p className="incidents-subtitle">Record and track barangay complaints, blotter reports, and dispute resolutions.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="add-btn">
          + File New Incident Report
        </button>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <input
          type="text"
          placeholder="Search by Case No., Complainant, Respondent, or Type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="residents-table">
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading incident reports...</td>
              </tr>
            ) : filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No blotter records found.</td>
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
                    <span className={`badge ${item.status === 'Active' ? 'active-case' : item.status === 'Settled' ? 'settled-case' : 'escalated-case'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btn-group">
                      {item.status === 'Active' && (
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

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">New Blotter / Incident Entry</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
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

              <div className="form-row">
                <div>
                  <label className="form-label">Complainant Name (Nagrereklamo)</label>
                  <input
                    type="text"
                    name="complainant_name"
                    value={formData.complainant_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Respondent Name (Inirereklamo)</label>
                  <input
                    type="text"
                    name="respondent_name"
                    value={formData.respondent_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Incident Type</label>
                  <select
                    name="incident_type"
                    value={formData.incident_type}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Noise Disturbance">Noise Disturbance</option>
                    <option value="Physical Dispute / Altercation">Physical Dispute / Altercation</option>
                    <option value="Property Damage / Boundary Issue">Property Damage / Boundary Issue</option>
                    <option value="Theft / Trespassing">Theft / Trespassing</option>
                    <option value="Other Misconduct">Other Misconduct</option>
                  </select>
                </div>

                <div>
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

              <div className="form-group">
                <label className="form-label">Incident Date</label>
                <input
                  type="date"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Details / Narrative Description</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="3"
                  className="form-input"
                  placeholder="Provide brief statement or details of the complaint..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="save-btn"
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