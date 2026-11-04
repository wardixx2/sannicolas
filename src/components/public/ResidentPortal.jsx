import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import './ResidentPortal.css'

export default function ResidentPortal({ onBack }) {
  const [session, setSession] = useState(null)
  const [viewState, setViewState] = useState('register') 
  const [regStep, setRegStep] = useState(1) 
  const [activeTab, setActiveTab] = useState('requests') 

  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [residentForm, setResidentForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    birth_date: '',
    gender: 'Male',
    civil_status: 'Single',
    contact_no: '',
    household_no: '',
    purok: 'Purok 1',
    street_address: ''
  })

  const [docType, setDocType] = useState('Barangay Clearance')
  const [docPurpose, setDocPurpose] = useState('Local Employment Requirement')
  const [requestsList, setRequestsList] = useState([])
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        checkIfResidentExists(session.user.email)
      }
    })
  }, [])

  const checkIfResidentExists = async (userEmail) => {
    const { data: res } = await supabase
      .from('residents')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (res) {
      setProfileData(res)
      setViewState('dashboard')
      fetchResidentData(userEmail)
    } else {
      setViewState('register')
      setRegStep(3)
    }
  }

  const fetchResidentData = async (userEmail) => {
    const { data: docs } = await supabase
      .from('document_requests')
      .select('*')
      .eq('email', userEmail)
      .order('created_at', { ascending: false })

    if (docs) setRequestsList(docs)
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: true }
    })

    if (error) {
      setStatusMsg('Error sending code: ' + error.message)
    } else {
      setRegStep(2)
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg('')

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otpCode,
      type: 'email'
    })

    if (error) {
      setStatusMsg('Invalid or expired code: ' + error.message)
      setLoading(false)
    } else {
      if (data?.session) {
        setSession(data.session)
      }
      setRegStep(3)
      setLoading(false)
    }
  }

  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg('')

    if (password) {
      await supabase.auth.updateUser({ password: password })
    }

    const currentEmail = email || session?.user?.email
    const fullName = `${residentForm.first_name} ${residentForm.middle_name ? residentForm.middle_name + ' ' : ''}${residentForm.last_name} ${residentForm.suffix}`.trim()
    
    const { error } = await supabase.from('residents').insert([
      {
        email: currentEmail,
        first_name: residentForm.first_name,
        middle_name: residentForm.middle_name,
        last_name: residentForm.last_name,
        suffix: residentForm.suffix,
        full_name: fullName,
        birth_date: residentForm.birth_date,
        gender: residentForm.gender,
        civil_status: residentForm.civil_status,
        contact_no: residentForm.contact_no,
        household_no: residentForm.household_no,
        purok: residentForm.purok,
        street_address: residentForm.street_address,
        address: `${residentForm.purok}, Barangay San Nicolas, Castillejos, Zambales`
      }
    ])

    if (error) {
      setStatusMsg('Error saving profile: ' + error.message)
    } else {
      setViewState('dashboard')
      fetchResidentData(currentEmail)
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    })

    if (error) {
      setStatusMsg(error.message)
    } else if (data?.session) {
      setSession(data.session)
      checkIfResidentExists(loginEmail)
    }
    setLoading(false)
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    setLoading(true)

    const resName = profileData ? profileData.full_name : session?.user?.email
    const resPurok = profileData ? profileData.purok : 'Purok 1'
    const resContact = profileData ? profileData.contact_no : 'N/A'
    const userEmail = session?.user?.email || email

    const { error } = await supabase.from('document_requests').insert([
      {
        email: userEmail,
        resident_name: resName,
        purok: resPurok,
        contact_no: resContact,
        document_type: docType,
        purpose: docPurpose,
        status: 'Pending',
        appointment_date: new Date().toISOString().split('T')[0]
      }
    ])

    if (error) {
      alert('Error creating request: ' + error.message)
    } else {
      alert('Document request submitted successfully!')
      setActiveTab('requests')
      fetchResidentData(userEmail)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setViewState('login')
  }

  if (viewState !== 'dashboard') {
    return (
      <div className="portal-auth-container">
        {onBack && (
          <button onClick={onBack} className="btn-back-home">
            ← Back to Home
          </button>
        )}

        {viewState === 'login' ? (
          <div className="auth-card">
            <h2 className="auth-title">Resident Portal Login</h2>
            <p className="auth-subtitle">Sign in to manage your document requests.</p>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <label>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="resident@gmail.com" 
                  required 
                />
              </div>

              <div className="input-group">
                <label>PASSWORD</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                />
              </div>

              {statusMsg && <div className="error-alert">{statusMsg}</div>}

              <button type="submit" disabled={loading} className="btn-amber-action">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer-text">
              Don't have an account? <span onClick={() => { setViewState('register'); setRegStep(1); }}>Register Now</span>
            </div>
          </div>
        ) : (
          <div className={`auth-card ${regStep === 3 ? 'wide-card' : ''}`}>
            {/* Step Indicators */}
            <div className="stepper-bar">
              <div className={`step-circle ${regStep === 1 ? 'active-amber' : regStep > 1 ? 'completed-black' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step-circle ${regStep === 2 ? 'active-amber' : regStep > 2 ? 'completed-black' : ''}`}>2</div>
              <div className="step-line"></div>
              <div className={`step-circle ${regStep === 3 ? 'active-amber' : ''}`}>3</div>
            </div>

            {regStep === 1 && (
              <>
                <h2 className="auth-title">Step 1: Email Verification</h2>
                <p className="auth-subtitle">Enter your active Gmail address to receive a 6-digit verification code.</p>

                <form onSubmit={handleSendOTP} className="auth-form">
                  <div className="input-group">
                    <label>EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="resident@gmail.com" 
                      required 
                    />
                  </div>

                  {statusMsg && <div className="error-alert">{statusMsg}</div>}

                  <button type="submit" disabled={loading} className="btn-amber-action">
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </form>
              </>
            )}

            {regStep === 2 && (
              <>
                <h2 className="auth-title">Step 2: Verification Code</h2>
                <p className="auth-subtitle">We sent a 6-digit code to <strong>{email}</strong>.</p>

                <form onSubmit={handleVerifyOTP} className="auth-form">
                  <div className="input-group">
                    <label>ENTER 6-DIGIT CODE</label>
                    <input 
                      type="text" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="202939" 
                      maxLength="6"
                      className="centered-code-input"
                      required 
                    />
                  </div>

                  {statusMsg && <div className="error-alert">{statusMsg}</div>}

                  <button type="submit" disabled={loading} className="btn-amber-action">
                    {loading ? 'Verifying...' : 'Verify Code & Open Form'}
                  </button>
                </form>
              </>
            )}

            {regStep === 3 && (
              <div className="resident-form-step-wrapper">
                <h2 className="auth-title">Step 3: Resident Form</h2>
                <p className="auth-subtitle">Email verified! Please complete your details to finish registration.</p>
                
                <div className="form-divider-line"></div>

                <form onSubmit={handleCompleteRegistration} className="auth-form">
                  <div className="section-label">PORTAL PASSWORD</div>
                  <div className="input-group">
                    <label>SET PASSWORD *</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      required 
                    />
                  </div>

                  <div className="section-label" style={{ marginTop: '12px' }}>PERSONAL INFORMATION</div>
                  <div className="form-grid-4">
                    <div className="input-group">
                      <label>FIRST NAME *</label>
                      <input type="text" required value={residentForm.first_name} onChange={(e) => setResidentForm({...residentForm, first_name: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>MIDDLE NAME</label>
                      <input type="text" value={residentForm.middle_name} onChange={(e) => setResidentForm({...residentForm, middle_name: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>LAST NAME *</label>
                      <input type="text" required value={residentForm.last_name} onChange={(e) => setResidentForm({...residentForm, last_name: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>SUFFIX</label>
                      <input type="text" placeholder="Jr." value={residentForm.suffix} onChange={(e) => setResidentForm({...residentForm, suffix: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="input-group">
                      <label>DATE OF BIRTH *</label>
                      <input type="date" required value={residentForm.birth_date} onChange={(e) => setResidentForm({...residentForm, birth_date: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>GENDER *</label>
                      <select value={residentForm.gender} onChange={(e) => setResidentForm({...residentForm, gender: e.target.value})}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>CIVIL STATUS</label>
                      <select value={residentForm.civil_status} onChange={(e) => setResidentForm({...residentForm, civil_status: e.target.value})}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>PHONE NUMBER *</label>
                    <input type="tel" placeholder="09123456789" required value={residentForm.contact_no} onChange={(e) => setResidentForm({...residentForm, contact_no: e.target.value})} />
                  </div>

                  <div className="section-label" style={{ marginTop: '12px' }}>RESIDENCE ADDRESS</div>
                  <div className="form-grid-3">
                    <div className="input-group">
                      <label>HOUSEHOLD NO. *</label>
                      <input type="text" placeholder="HH-2026-001" required value={residentForm.household_no} onChange={(e) => setResidentForm({...residentForm, household_no: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>PUROK *</label>
                      <select value={residentForm.purok} onChange={(e) => setResidentForm({...residentForm, purok: e.target.value})}>
                        <option value="Purok 1">Purok 1</option>
                        <option value="Purok 2">Purok 2</option>
                        <option value="Purok 3">Purok 3</option>
                        <option value="Purok 4">Purok 4</option>
                        <option value="Purok 5">Purok 5</option>
                        <option value="Purok 6">Purok 6</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>STREET ADDRESS</label>
                      <input type="text" placeholder="Main St." value={residentForm.street_address} onChange={(e) => setResidentForm({...residentForm, street_address: e.target.value})} />
                    </div>
                  </div>

                  {statusMsg && <div className="error-alert">{statusMsg}</div>}

                  <button type="submit" disabled={loading} className="btn-amber-action" style={{ marginTop: '16px' }}>
                    {loading ? 'Saving Registration...' : 'Complete & Save Registration'}
                  </button>
                </form>
              </div>
            )}

            <div className="auth-footer-text">
              Already have an account? <span onClick={() => setViewState('login')}>Sign In</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const pendingCount = requestsList.filter(r => r.status?.toLowerCase() === 'pending').length
  const readyCount = requestsList.filter(r => r.status?.toLowerCase() === 'approved').length
  const completedCount = requestsList.filter(r => r.status?.toLowerCase() === 'released' || r.status?.toLowerCase() === 'completed').length

  return (
    <div className="resident-dashboard-layout">
      <aside className="resident-sidebar">
        <div className="sidebar-top">
          <div className="app-brand">
            <div className="brand-icon-box">🏛️</div>
            <div>
              <h3>San Nicolas</h3>
              <p>E-Governance Portal</p>
            </div>
          </div>

          <div className="nav-section-title">RESIDENT SERVICES</div>

          <nav className="sidebar-menu">
            <button onClick={() => setActiveTab('requests')} className={`menu-btn ${activeTab === 'requests' ? 'active' : ''}`}>
              <span className="menu-icon">🗂️</span> My Requests
            </button>
            <button onClick={() => setActiveTab('create-request')} className={`menu-btn ${activeTab === 'create-request' ? 'active' : ''}`}>
              <span className="menu-icon">📑</span> Request Document
            </button>
            <button onClick={() => setActiveTab('profile')} className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`}>
              <span className="menu-icon">👤</span> Resident Profile
            </button>
          </nav>
        </div>

        <div className="sidebar-user-footer">
          <div className="signed-tag">SIGNED IN AS</div>
          <div className="user-email-text">{session?.user?.email || email}</div>
          <span className="badge-resident">RESIDENT</span>

          <button onClick={handleSignOut} className="btn-logout-red">
            [→ Sign Out
          </button>

          <div className="weather-footer">
            <span>☀️ 32°C</span>
            <span>Partly sunny</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main-content">
        {activeTab === 'requests' && (
          <div className="tab-content">
            <div className="portal-stats-grid">
              <div className="portal-stat-card amber">
                <div className="stat-circle-icon amber">🕒</div>
                <div>
                  <div className="stat-label">PENDING REQUESTS</div>
                  <div className="stat-number">{pendingCount}</div>
                </div>
              </div>

              <div className="portal-stat-card green">
                <div className="stat-circle-icon green">✓</div>
                <div>
                  <div className="stat-label">READY FOR PICKUP</div>
                  <div className="stat-number">{readyCount}</div>
                </div>
              </div>

              <div className="portal-stat-card blue">
                <div className="stat-circle-icon blue">📄</div>
                <div>
                  <div className="stat-label">COMPLETED DOCUMENTS</div>
                  <div className="stat-number">{completedCount}</div>
                </div>
              </div>
            </div>

            <div className="white-panel-card">
              <h3 className="panel-title">Request History & Tracking</h3>
              <hr className="divider" />

              {requestsList.length === 0 ? (
                <div className="empty-state-box">
                  <div className="info-circle-icon">ⓘ</div>
                  <p>No document requests found.</p>
                </div>
              ) : (
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Purpose</th>
                      <th>Date Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsList.map((req) => (
                      <tr key={req.id}>
                        <td><strong>{req.document_type}</strong></td>
                        <td>{req.purpose}</td>
                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-pill ${req.status?.toLowerCase()}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'create-request' && (
          <div className="tab-content">
            <div className="white-panel-card form-max-width">
              <h2 className="form-header-title">Online Document Application</h2>
              <p className="form-header-sub">Select document type and official purpose for processing.</p>

              <form onSubmit={handleCreateRequest} className="document-app-form">
                <div className="input-group">
                  <label>DOCUMENT TYPE</label>
                  <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="Barangay Clearance">Barangay Clearance</option>
                    <option value="Certificate of Indigency">Certificate of Indigency</option>
                    <option value="Certificate of Residency">Certificate of Residency</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>PURPOSE OF REQUEST</label>
                  <select value={docPurpose} onChange={(e) => setDocPurpose(e.target.value)}>
                    <option value="Local Employment Requirement">Local Employment Requirement</option>
                    <option value="Scholarship Application">Scholarship Application</option>
                    <option value="Financial Assistance">Financial Assistance</option>
                    <option value="Valid ID Application">Valid ID Application</option>
                  </select>
                </div>

                <div className="amber-notice-box">
                  <strong>In-Person Fee Notice:</strong> Document fees (₱50.00 standard) are paid strictly in cash at the Barangay Hall upon physical pickup.
                </div>

                <button type="submit" disabled={loading} className="btn-amber-action">
                  {loading ? 'Submitting...' : 'Submit Document Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="white-panel-card form-max-width" style={{ textAlign: 'center', padding: '24px' }}>
              <div className="avatar-circle">
                {profileData?.first_name ? profileData.first_name.charAt(0) : 'R'}
              </div>
              <span className="profile-status-badge">✓ Registered Resident</span>

              <hr className="divider" style={{ margin: '16px 0' }} />

              <div className="profile-details-list">
                <div className="profile-detail-row">
                  <span className="detail-icon">👤</span>
                  <span className="detail-label">Role:</span>
                  <strong>Resident</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon">📞</span>
                  <span className="detail-label">Contact Number:</span>
                  <strong>{profileData?.contact_no || 'N/A'}</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon">📍</span>
                  <span className="detail-label">Address:</span>
                  <strong>{profileData?.address || 'Barangay San Nicolas, Castillejos, Zambales'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}