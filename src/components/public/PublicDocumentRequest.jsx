import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import './PublicDocumentRequest.css'

export default function PublicDocumentRequest({ onBack }) {
  const [step, setStep] = useState(1) // 1: Email Input, 2: OTP Verification & Request Form, 3: Success
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  
  const [formData, setFormData] = useState({
    resident_name: '',
    purok: 'Purok 1',
    contact_no: '',
    document_type: 'Barangay Clearance',
    purpose: '',
    appointment_date: new Date().toISOString().split('T')[0]
  })

  // Hakbang 1: I-trigger ang pagpadala ng Code sa Gmail
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true, // Awtomatikong gagawa ng account kung bago pa lang
      }
    })

    if (error) {
      alert('Error sending verification code: ' + error.message)
    } else {
      alert('Matagumpay na naipadala ang verification code sa iyong Gmail. Mangyaring suriin ang iyong Inbox o Spam.')
      setStep(2) // Lumipat sa verification at request form
    }
    setLoading(false)
  }

  // Hakbang 2: I-verify ang Code at I-save ang Document Request
  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. I-verify ang OTP code gamit ang Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    })

    if (authError) {
      alert('Maling verification code: ' + authError.message)
      setLoading(false)
      return
    }

    // 2. Kung tama ang code, i-save na ang request sa 'document_requests' table
    const { error: insertError } = await supabase
      .from('document_requests')
      .insert([
        {
          ...formData,
          status: 'Pending'
        }
      ])

    if (insertError) {
      alert('Error saving request: ' + insertError.message)
    } else {
      setStep(3) // Tagumpay
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="public-form-container">
      <div className="public-form-card">
        {/* Back Button */}
        {onBack && step !== 3 && (
          <button 
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0
            }}
          >
            ← Back to Home
          </button>
        )}

        <div className="public-header">
          <h2>BARANGAY SAN NICOLAS</h2>
          <p>Online Document Request Portal</p>
        </div>

        {/* STEP 3: SUCCESS SCREEN */}
        {step === 3 ? (
          <div className="success-box">
            <h3>✅ Matagumpay na Naitala ang Inyong Request!</h3>
            <p>
              Salamat, <strong>{formData.resident_name}</strong>. Ang inyong kahilingan para sa <strong>{formData.document_type}</strong> gamit ang email na <em>{email}</em> ay kasalukuyan nang pinoproseso.
            </p>
            <p className="note">
              Mangyaring magtungo sa Barangay Hall sa nakatakdang petsa: <strong>{formData.appointment_date}</strong>.
            </p>
            <button 
              onClick={() => {
                setStep(1)
                setEmail('')
                setToken('')
                setFormData({
                  resident_name: '',
                  purok: 'Purok 1',
                  contact_no: '',
                  document_type: 'Barangay Clearance',
                  purpose: '',
                  appointment_date: new Date().toISOString().split('T')[0]
                })
              }} 
              className="btn-reset"
            >
              Mag-request ng Iba Pang Dokumento
            </button>
          </div>
        ) : step === 1 ? (
          /* STEP 1: EMAIL INPUT PARA SA OTP */
          <form onSubmit={handleSendOTP} className="public-form">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#475569' }}>
                Bago mag-request ng dokumento, kinakailangang i-verify muna ang iyong Gmail account.
              </p>
            </div>

            <div className="form-group">
              <label>Gmail Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hal. resident@gmail.com"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit" style={{ marginTop: '12px' }}>
              {loading ? 'Nagpapadala ng Code...' : 'Ipadala ang Verification Code sa Gmail'}
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP CODE & FILL REQUEST FORM */
          <form onSubmit={handleVerifyAndSubmit} className="public-form">
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
              May ipinadala kaming 6-digit verification code sa: <strong>{email}</strong>
            </div>

            <div className="form-group">
              <label>Verification Code (OTP) *</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ilagay ang code mula sa email"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', letterSpacing: '2px' }}
              />
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

            <div className="form-group">
              <label>Buong Pangalan (Full Name) *</label>
              <input
                type="text"
                name="resident_name"
                value={formData.resident_name}
                onChange={handleChange}
                placeholder="hal. Juan Dela Cruz"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Purok / Zone *</label>
                <select name="purok" value={formData.purok} onChange={handleChange}>
                  <option value="Purok 1">Purok 1</option>
                  <option value="Purok 2">Purok 2</option>
                  <option value="Purok 3">Purok 3</option>
                  <option value="Purok 4">Purok 4</option>
                  <option value="Purok 5">Purok 5</option>
                  <option value="Purok 6">Purok 6</option>
                </select>
              </div>

              <div className="form-group">
                <label>Numero ng Telepono *</label>
                <input
                  type="tel"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleChange}
                  placeholder="09123456789"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Uri ng Dokumento *</label>
                <select name="document_type" value={formData.document_type} onChange={handleChange}>
                  <option value="Barangay Clearance">Barangay Clearance</option>
                  <option value="Certificate of Indigency">Certificate of Indigency</option>
                  <option value="Certificate of Residency">Certificate of Residency</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Pickup Date *</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Layunin (Purpose) *</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows="3"
                placeholder="hal. Para sa Employment"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Baguhin ang Email
              </button>
              <button type="submit" disabled={loading} className="btn-submit" style={{ flex: 1 }}>
                {loading ? 'Binibigyang-katiyakan...' : 'I-verify at I-submit ang Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}