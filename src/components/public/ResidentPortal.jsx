import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { 
  User, 
  Home, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Send, 
  Clock, 
  Heart, 
  Accessibility, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  ArrowLeft,
  LogOut
} from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    street_address: '',
    role_type: 'Member',
    house_leader: '',
    resident_since: 'Since Birth',
    life_status: 'Alive',
    is_pwd: 'No'
  })

  const [sinceType, setSinceType] = useState('since_birth')
  const [docType, setDocType] = useState('Barangay Clearance')
  const [docPurpose, setDocPurpose] = useState('Local Employment Requirement')
  const [requestsList, setRequestsList] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [houseLeadersList, setHouseLeadersList] = useState([])

  useEffect(() => {
    fetchHouseLeaders()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        checkIfResidentExists(session.user.email)
      }
    })
  }, [])

  const fetchHouseLeaders = async () => {
    const { data } = await supabase
      .from('residents')
      .select('id, full_name, first_name, last_name')
      .eq('role_type', 'House Leader')
    if (data) setHouseLeadersList(data)
  }

  const checkIfResidentExists = async (userEmail) => {
    const { data: res } = await supabase
      .from('residents')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()

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

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A'
    const birthDateObj = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birthDateObj.getFullYear()
    const m = today.getMonth() - birthDateObj.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }
    return age >= 0 ? `${age} years old` : 'N/A'
  }

  const calculateYearsAsResident = (residentSinceDate, birthdate) => {
    const targetDate = residentSinceDate === 'Since Birth' ? birthdate : residentSinceDate
    if (!targetDate) return 'N/A'
    
    const startDate = new Date(targetDate)
    const today = new Date()
    let years = today.getFullYear() - startDate.getFullYear()
    const m = today.getMonth() - startDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() - startDate.getDate())) {
      years--
    }
    if (isNaN(years) || years < 0) return 'N/A'
    if (years === 0) return 'Less than 1 year resident'
    return `${years} ${years === 1 ? 'year' : 'years'} resident`
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
    const finalResidentSince = sinceType === 'since_birth' ? 'Since Birth' : residentForm.resident_since

    const { error } = await supabase.from('residents').insert([
      {
        ...residentForm,
        email: currentEmail,
        full_name: fullName,
        resident_since: finalResidentSince,
        address: `${residentForm.street_address ? residentForm.street_address + ', ' : ''}${residentForm.purok}, Barangay San Nicolas, Castillejos, Zambales`
      }
    ])

    if (error) {
      setStatusMsg('Error saving profile: ' + error.message)
    } else {
      checkIfResidentExists(currentEmail)
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
          <button onClick={onBack} className="btn-styled-back">
            <ArrowLeft size={16} /> Back to Home
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
                <h2 className="auth-title">Step 3: Resident Registration Form</h2>
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
                  
                  <div className="input-group">
                    <label>ROLE / DESIGNATION *</label>
                    <div className="radio-group-container">
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name="role_type" 
                          value="Member" 
                          checked={residentForm.role_type === 'Member'} 
                          onChange={(e) => setResidentForm({...residentForm, role_type: e.target.value})} 
                        /> Member
                      </label>
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name="role_type" 
                          value="House Leader" 
                          checked={residentForm.role_type === 'House Leader'} 
                          onChange={(e) => setResidentForm({...residentForm, role_type: e.target.value})} 
                        /> House Leader
                      </label>
                    </div>
                  </div>

                  <div className="form-grid-responsive">
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
                  </div>

                  <div className="form-grid-responsive">
                    <div className="input-group">
                      <label>SUFFIX</label>
                      <input type="text" placeholder="Jr." value={residentForm.suffix} onChange={(e) => setResidentForm({...residentForm, suffix: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>DATE OF BIRTH *</label>
                      <input type="date" required value={residentForm.birth_date} onChange={(e) => setResidentForm({...residentForm, birth_date: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>PHONE NUMBER *</label>
                      <input type="tel" placeholder="09123456789" required value={residentForm.contact_no} onChange={(e) => setResidentForm({...residentForm, contact_no: e.target.value})} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>GENDER *</label>
                    <div className="radio-group-container">
                      <label className="radio-label">
                        <input type="radio" name="gender" value="Male" checked={residentForm.gender === 'Male'} onChange={(e) => setResidentForm({...residentForm, gender: e.target.value})} /> Male
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="gender" value="Female" checked={residentForm.gender === 'Female'} onChange={(e) => setResidentForm({...residentForm, gender: e.target.value})} /> Female
                      </label>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>CIVIL STATUS *</label>
                    <div className="radio-group-container">
                      {['Single', 'Married', 'Widowed', 'Separated'].map(status => (
                        <label key={status} className="radio-label">
                          <input type="radio" name="civil_status" value={status} checked={residentForm.civil_status === status} onChange={(e) => setResidentForm({...residentForm, civil_status: e.target.value})} /> {status}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="section-label" style={{ marginTop: '12px' }}>HOUSEHOLD & LOCATION DETAILS</div>
                  
                  <div className="form-grid-household">
                    <div className="input-group">
                      <label>HOUSEHOLD NO. *</label>
                      <input 
                        type="text" 
                        placeholder="HH-001" 
                        required 
                        value={residentForm.household_no} 
                        onChange={(e) => setResidentForm({...residentForm, household_no: e.target.value})} 
                      />
                    </div>
                    <div className="input-group">
                      <label>HOUSE LEADER CHOICE</label>
                      <select 
                        value={residentForm.house_leader} 
                        onChange={(e) => setResidentForm({...residentForm, house_leader: e.target.value})}
                        style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        <option value="">-- Select House Leader --</option>
                        {houseLeadersList.map(leader => {
                          const leaderName = leader.full_name || `${leader.first_name} ${leader.last_name}`
                          return <option key={leader.id} value={leaderName}>{leaderName}</option>
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>PUROK *</label>
                    <div className="purok-grid-container">
                      {['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6', 'Purok 7'].map(purok => (
                        <label key={purok} className="radio-label">
                          <input 
                            type="radio" 
                            name="purok" 
                            value={purok} 
                            checked={residentForm.purok === purok} 
                            onChange={(e) => setResidentForm({...residentForm, purok: e.target.value})} 
                          /> {purok}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '8px' }}>
                    <label>STREET ADDRESS</label>
                    <input type="text" placeholder="House No. / Street Name" value={residentForm.street_address} onChange={(e) => setResidentForm({...residentForm, street_address: e.target.value})} />
                  </div>

                  <div className="section-label" style={{ marginTop: '12px' }}>BARANGAY RESIDENCY & STATUS</div>
                  <div className="form-grid-responsive">
                    <div className="input-group">
                      <label>RESIDENT SINCE</label>
                      <div className="radio-group-container">
                        <label className="radio-label">
                          <input type="radio" name="since_type" value="since_birth" checked={sinceType === 'since_birth'} onChange={(e) => setSinceType(e.target.value)} /> Since Birth
                        </label>
                        <label className="radio-label">
                          <input type="radio" name="since_type" value="custom_date" checked={sinceType === 'custom_date'} onChange={(e) => setSinceType(e.target.value)} /> Custom Date
                        </label>
                      </div>
                      {sinceType === 'custom_date' && (
                        <input type="date" style={{ marginTop: '4px' }} value={residentForm.resident_since === 'Since Birth' ? '' : residentForm.resident_since} onChange={(e) => setResidentForm({...residentForm, resident_since: e.target.value})} />
                      )}
                    </div>
                    <div className="input-group">
                      <label>LIFE STATUS</label>
                      <div className="radio-group-container">
                        <label className="radio-label">
                          <input type="radio" name="life_status" value="Alive" checked={residentForm.life_status === 'Alive'} onChange={(e) => setResidentForm({...residentForm, life_status: e.target.value})} /> Alive
                        </label>
                        <label className="radio-label">
                          <input type="radio" name="life_status" value="Deceased" checked={residentForm.life_status === 'Deceased'} onChange={(e) => setResidentForm({...residentForm, life_status: e.target.value})} /> Deceased
                        </label>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>PWD STATUS</label>
                      <div className="radio-group-container">
                        <label className="radio-label">
                          <input type="radio" name="is_pwd" value="No" checked={residentForm.is_pwd === 'No'} onChange={(e) => setResidentForm({...residentForm, is_pwd: e.target.value})} /> No
                        </label>
                        <label className="radio-label">
                          <input type="radio" name="is_pwd" value="Yes" checked={residentForm.is_pwd === 'Yes'} onChange={(e) => setResidentForm({...residentForm, is_pwd: e.target.value})} /> Yes
                        </label>
                      </div>
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
      <div className="mobile-topbar">
        <div className="app-brand" style={{ margin: 0 }}>
          <div className="brand-icon-box">🏛️</div>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>San Nicolas Portal</h3>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-toggle-btn">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <aside className={`resident-sidebar ${mobileMenuOpen ? 'open-mobile' : ''}`}>
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
            <button onClick={() => { setActiveTab('requests'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'requests' ? 'active' : ''}`}>
              <FileText size={16} /> My Requests
            </button>
            <button onClick={() => { setActiveTab('create-request'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'create-request' ? 'active' : ''}`}>
              <Send size={16} /> Request Document
            </button>
            <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`}>
              <User size={16} /> Resident Profile
            </button>
          </nav>
        </div>

        <div className="sidebar-user-footer">
          <div className="signed-tag">SIGNED IN AS</div>
          <div className="user-email-text">{session?.user?.email || email}</div>
          <span className="badge-resident">RESIDENT</span>

          <button onClick={handleSignOut} className="btn-logout-red">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main-content">
        {activeTab === 'requests' && (
          <div className="tab-content">
            <div className="portal-stats-grid">
              <div className="portal-stat-card amber">
                <div className="stat-circle-icon amber"><Clock size={20} /></div>
                <div>
                  <div className="stat-label">PENDING REQUESTS</div>
                  <div className="stat-number">{pendingCount}</div>
                </div>
              </div>

              <div className="portal-stat-card green">
                <div className="stat-circle-icon green"><CheckCircle size={20} /></div>
                <div>
                  <div className="stat-label">READY FOR PICKUP</div>
                  <div className="stat-number">{readyCount}</div>
                </div>
              </div>

              <div className="portal-stat-card blue">
                <div className="stat-circle-icon blue"><FileText size={20} /></div>
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
                  <AlertCircle size={24} style={{ marginBottom: '6px' }} />
                  <p>No document requests found.</p>
                </div>
              ) : (
                <div className="table-responsive-container">
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
                </div>
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
                  <div className="radio-group-container vertical" style={{ marginTop: '6px' }}>
                    {['Barangay Clearance', 'Certificate of Indigency', 'Certificate of Residency', 'First Time Job Seeker Certificate'].map(type => (
                      <label key={type} className="radio-label">
                        <input type="radio" name="docType" value={type} checked={docType === type} onChange={(e) => setDocType(e.target.value)} /> {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="input-group" style={{ marginTop: '14px' }}>
                  <label>PURPOSE OF REQUEST</label>
                  <div className="radio-group-container vertical" style={{ marginTop: '6px' }}>
                    {['Local Employment Requirement', 'Scholarship Application', 'Financial Assistance', 'Valid ID Application'].map(purpose => (
                      <label key={purpose} className="radio-label">
                        <input type="radio" name="docPurpose" value={purpose} checked={docPurpose === purpose} onChange={(e) => setDocPurpose(e.target.value)} /> {purpose}
                      </label>
                    ))}
                  </div>
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
            <div className="white-panel-card form-max-width" style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="avatar-circle">
                  {profileData?.first_name ? profileData.first_name.charAt(0) : 'R'}
                </div>
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px', color: '#0f172a' }}>
                  {profileData ? (profileData.full_name || `${profileData.first_name} ${profileData.last_name}`) : 'Resident Profile'}
                </h3>
                <span className="profile-status-badge">✓ Registered Resident</span>
              </div>

              <hr className="divider" style={{ margin: '16px 0' }} />

              <div className="profile-details-list">
                <div className="profile-detail-row">
                  <span className="detail-icon"><ShieldCheck size={16} /></span>
                  <span className="detail-label">Role / Status:</span>
                  <strong>{profileData?.role_type || 'Member'}</strong>
                </div>

                {profileData?.role_type !== 'House Leader' && (
                  <div className="profile-detail-row">
                    <span className="detail-icon"><User size={16} /></span>
                    <span className="detail-label">House Leader:</span>
                    <strong style={{ color: '#2563eb' }}>{profileData?.house_leader || 'N/A'}</strong>
                  </div>
                )}

                <div className="profile-detail-row">
                  <span className="detail-icon"><Home size={16} /></span>
                  <span className="detail-label">Household No:</span>
                  <strong>{profileData?.household_no || 'N/A'}</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon"><Phone size={16} /></span>
                  <span className="detail-label">Contact Number:</span>
                  <strong>{profileData?.contact_no || 'N/A'}</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon"><MapPin size={16} /></span>
                  <span className="detail-label">Address:</span>
                  <strong>{profileData?.address || `${profileData?.purok || 'San Nicolas'}, Castillejos, Zambales`}</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon"><Calendar size={16} /></span>
                  <span className="detail-label">Age / Gender:</span>
                  <strong>{calculateAge(profileData?.birth_date)} ({profileData?.gender || 'N/A'})</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon"><Clock size={16} /></span>
                  <span className="detail-label">Residency Duration:</span>
                  <strong>{calculateYearsAsResident(profileData?.resident_since, profileData?.birth_date)}</strong>
                </div>

                <div className="profile-detail-row">
                  <span className="detail-icon"><Accessibility size={16} /></span>
                  <span className="detail-label">PWD Status:</span>
                  <strong>{profileData?.is_pwd === 'Yes' ? 'Registered PWD' : 'None'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}